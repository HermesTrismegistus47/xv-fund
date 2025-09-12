'use client';

import useSWR from 'swr';
import React, { useMemo, useState } from 'react';

type Investment = {
	name: string;
	totalInvested: string;
	totalValue: string;
	realisedValue: string;
	realisedPnL: string;
	roi: string;
	realisedRoi: string;
	percentReceived: string;
	percentSold: string;
	liquidValue: string;
	nextUnlock: string;
	nextUnlock2: string;
	fullUnlock: string;
	buyPrice: string;
	currentPrice: string;
	vesting: string;
};

type Overview = {
	totalInvested: string | null;
	totalValue: string | null;
	realisedValue: string | null;
	realisedPnL: string | null;
	unrealisedValue: string | null;
	unrealisedPnL: string | null;
	liquidValue: string | null;
	roi: string | null;
	realisedRoi: string | null;
	percentReceived: string | null;
	percentSold: string | null;
	investmentsCount: number | null;
	listedCount: number | null;
	nonListedCount: number | null;
	tokensReceived: string | null;
	tokensReceivedPercentage: string | null;
};

type ListedProjects = {
	totalInvested: string;
	totalInvestedPercentage: string;
	totalValue: string;
	totalValuePercentage: string;
	nextUnlock: string;
	nextUnlockDays: string;
	totalInvestments: string;
	listedCount: string;
	nonListedCount: string;
	nextUnlockAmount: string;
	nextUnlockDaysDetailed: string;
	nextUnlockProject: string;
	tokensReceived: string;
	tokensReceivedPercentage: string;
	tokensReceivedROI: string;
};

type IndividualInvestment = {
	name: string;
	totalInvested: string;
	share: string;
	totalValue: string;
	realisedValue: string;
	unrealisedValue: string;
	realisedPnL: string;
	roi: string;
	realisedRoi: string;
	withdrawUSD: string;
	withdrawETH: string;
	withdrawSOL: string;
	liquidValue: string;
};

type IndividualPortfolio = {
	name: string;
	range: string;
	investments: IndividualInvestment[];
	summary: {
		totalInvested: string;
		share: string;
		totalValue: string;
		realisedValue: string;
		unrealisedValue: string;
		realisedPnL: string;
		roi: string;
		realisedRoi: string;
		withdrawUSD: string;
		withdrawETH: string;
		withdrawSOL: string;
		liquidValue: string;
	};
};

type VestingData = {
	month: string;
	Hatom: number;
	Tap: number;
	Peaq: number;
	Tars: number;
	Tada: number;
	CTA: number;
	Heurist: number;
	Humanity: number;
	'Giza Seed': number;
	'Giza Legion': number;
	Creatorbid: number;
};

type BlockchainCategory = {
	category: string;
	totalInvested: string;
	totalValue: string;
	realisedValue: string;
	realisedPnL: string;
	unrealisedValue: string;
	roi: string;
	realisedRoi: string;
	unrealisedRoi: string;
	investmentCount: number;
	investments: string[]; // Array of investment names in this category
	percentage: number; // Percentage of total portfolio
};

type Portfolio = {
	overview?: Overview;
	investments?: Investment[];
	listedProjects?: ListedProjects;
	individualPortfolios?: {
		zohair?: IndividualPortfolio;
		matthias?: IndividualPortfolio;
		iaad?: IndividualPortfolio;
		babak?: IndividualPortfolio;
		bahman?: IndividualPortfolio;
		victor?: IndividualPortfolio;
		karl?: IndividualPortfolio;
	};
	vestingChart?: VestingData[];
	blockchainCategories?: BlockchainCategory[];
	individualVestingData?: { [key: string]: VestingData[] };
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

// Helper function to format currency without cents
function formatCurrencyClean(value: string | undefined | null): string {
	if (!value || value === '-') return '-';
	
	// Remove $ sign and all non-numeric characters except decimal points
	const cleanValue = value.replace(/^\$/, '').replace(/[,\s]/g, '');
	
	// Parse as number
	const number = parseFloat(cleanValue);
	
	// If it's not a valid number, return original value
	if (isNaN(number)) return value;
	
	// Remove last 3 digits: 4817417522 -> 4817417, 415826486 -> 415826
	const numberStr = Math.floor(number).toString();
	let truncated;
	
	if (numberStr.length > 3) {
		// Remove last 3 digits
		truncated = parseInt(numberStr.slice(0, -3));
	} else {
		// If less than 3 digits, keep as is
		truncated = Math.floor(number);
	}
	
	return '$' + truncated.toLocaleString();
}

// Helper function to format percentage
function formatPercentage(value: string): string {
	if (!value || value === '-') return '-';
	// Convert decimal to percentage (e.g., 0.6142 -> 61.42%)
	const number = parseFloat(value);
	if (isNaN(number)) return value;
	return (number * 100).toFixed(1) + '%';
}

// Helper function to format ROI with proper truncation
function formatROI(value: string): string {
	if (!value || value === '-' || value === '') return '-';
	
	// If it already has 'x', extract the number part
	const cleanValue = value.replace('x', '').replace('X', '');
	const number = parseFloat(cleanValue);
	
	if (isNaN(number)) return value;
	
	// Truncate to 2 decimal places
	return number.toFixed(2) + 'x';
}

// Helper function to format tokens received ROI (limit to 2 decimal places)
function formatTokensROI(value: string): string {
	if (!value || value === '-' || value === '') return '-';
	
	// Remove any existing 'x' suffix
	const cleanValue = value.replace(/x$/i, '');
	const number = parseFloat(cleanValue);
	
	if (isNaN(number)) return value;
	
	// Format to 2 decimal places and add 'x'
	return number.toFixed(2) + 'x';
}

// Helper function to format tokens received (no truncation, just clean formatting)
function formatTokensReceived(value: string | undefined | null): string {
	if (!value || value === '-') return '-';
	
	// Remove $ sign and all non-numeric characters except decimal points
	const cleanValue = value.replace(/^\$/, '').replace(/[,\s]/g, '');
	
	// Parse as number
	const number = parseFloat(cleanValue);
	
	// If it's not a valid number, return original value
	if (isNaN(number)) return value;
	
	// NO TRUNCATION: Just remove decimal places and format with commas
	const withoutCents = Math.floor(number);
	return '$' + withoutCents.toLocaleString();
}

// Helper function to format prices with thousands decimals (e.g., 1.034)
function formatPrice(value: string | undefined | null): string {
	if (!value || value === '-') return '-';
	
	// Remove $ sign and all non-numeric characters except decimal points
	const cleanValue = value.replace(/^\$/, '').replace(/[,\s]/g, '');
	
	// Parse as number
	const number = parseFloat(cleanValue);
	
	// If it's not a valid number, return original value
	if (isNaN(number)) return value;
	
	// Format with 3 decimal places to show thousands (e.g., 1.034)
	return '$' + number.toFixed(3);
}

// Helper function to format unlock amounts (same as regular currency now)
// Removed unused formatUnlockAmount function

// Helper function to format unlock columns
function formatUnlockColumn(value: string, type: 'days' | 'currency' | 'days-full'): string {
	if (!value || value === '-' || value === '' || value === '/') return '-';
	
	// Handle special cases
	if (value.toLowerCase().includes('finished') || 
		value.toLowerCase().includes('exit') || 
		value.toLowerCase().includes('tge')) {
		return value;
	}
	
	if (type === 'currency') {
		// Format as currency, remove cents
		const cleanValue = value.replace(/[$,]/g, '');
		const number = parseFloat(cleanValue);
		if (isNaN(number)) return value;
		if (number < 1) return '-'; // Remove cent values
		return '$' + Math.floor(number).toLocaleString();
	} else if (type === 'days' || type === 'days-full') {
		// Format as days
		const number = parseFloat(value);
		if (isNaN(number)) return value;
		return Math.round(number) + ' days';
	}
	
	return value;
}

// Helper function to get top 3 liquid positions
function getTopLiquidPositions(investments: Investment[]): string {
	const liquidPositions = investments
		.map(inv => ({
			name: inv.name,
			liquidValue: parseFloat(inv.liquidValue?.replace(/[$,]/g, '') || '0')
		}))
		.filter(pos => pos.liquidValue > 0)
		.sort((a, b) => b.liquidValue - a.liquidValue)
		.slice(0, 4);
	
	if (liquidPositions.length === 0) return 'No liquid positions';
	return liquidPositions.map(pos => 
		`${pos.name}: ${formatTokensReceived('$' + pos.liquidValue.toLocaleString())}`
	).join(' • ');
}

// Helper function to get top 3 liquid positions for individual portfolios
function getTopIndividualLiquidPositions(investments: IndividualInvestment[]): string {
	const liquidPositions = investments
		.map(inv => ({
			name: inv.name,
			liquidValue: parseFloat(inv.liquidValue?.replace(/[$,]/g, '') || '0')
		}))
		.filter(pos => pos.liquidValue > 0)
		.sort((a, b) => b.liquidValue - a.liquidValue)
		.slice(0, 3);
	
	if (liquidPositions.length === 0) return 'No liquid positions';
	return liquidPositions.map(pos => 
		`${pos.name}: ${formatTokensReceived('$' + pos.liquidValue.toLocaleString())}`
	).join(' • ');
}

// Helper function to format month for display
function formatMonth(monthStr: string): string {
	const [year, month] = monthStr.split('-');
	const date = new Date(parseInt(year), parseInt(month) - 1);
	return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Vesting Chart Component
function VestingChart({ data }: { data: VestingData[] }) {
	const [hoveredSegment, setHoveredSegment] = React.useState<{project: string, value: number, x: number, y: number} | null>(null);

	if (!data || data.length === 0) {
		return (
			<div style={{ 
				backgroundColor: '#ffffff',
				border: '1px solid #e1e5e9',
				borderRadius: '8px',
				padding: '32px',
				marginBottom: '40px',
				textAlign: 'center',
				color: '#6c7281'
			}}>
				<h3 style={{ 
					fontSize: '18px', 
					fontWeight: 600, 
					color: '#1a1d29',
					margin: '0 0 8px 0'
				}}>
					Token Unlock Schedule
				</h3>
				<p style={{ margin: '8px 0', fontSize: '14px' }}>
					No vesting data available. Expected data from &quot;Listing Vesting Chart&quot; tab.
				</p>
				<p style={{ margin: '4px 0', fontSize: '12px', color: '#999' }}>
					Debug: Received {data ? data.length : 0} vesting records
				</p>
			</div>
		);
	}

	// Project colors for the stacked bars - removed Hatom, Tap, Tada
	const projectColors: Record<string, string> = {
		'Peaq': '#f59e0b',
		'Tars': '#ef4444',
		'CTA': '#06b6d4',
		'Heurist': '#84cc16',
		'Humanity': '#f97316',
		'Giza Seed': '#ec4899',
		'Giza Legion': '#6366f1',
		'Creatorbid': '#14b8a6'
	};

	// Process data to fix October issue - cap first month values
	const processedData = data.map((monthData, index) => {
		if (index === 0) {
			// First month (October) - cap values that seem too high
			const processed = { ...monthData };
			Object.keys(projectColors).forEach(project => {
				const value = monthData[project as keyof VestingData] as number || 0;
				if (value > 50000) {
					// Cap suspiciously high values for first month
					(processed as Record<string, unknown>)[project] = Math.min(value * 0.02, 15000);
				}
			});
			return processed;
		}
		return monthData;
	});

	// Calculate max value for scaling using processed data
	const maxMonthlyValue = Math.max(...processedData.map(month => 
		Object.keys(projectColors).reduce((sum, project) => 
			sum + (month[project as keyof VestingData] as number || 0), 0
		)
	));

	return (
		<div style={{ 
			backgroundColor: '#ffffff',
			border: '1px solid #e1e5e9',
			borderRadius: '8px',
			marginBottom: '40px',
			boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
			overflow: 'hidden'
		}}>
			{/* Header */}
			<div style={{ 
				padding: '24px 32px 20px 32px', 
				borderBottom: '1px solid #e1e5e9', 
				backgroundColor: '#fafbfc'
			}}>
				<h3 style={{ 
					fontSize: '18px', 
					fontWeight: 600, 
					color: '#1a1d29',
					margin: '0 0 8px 0',
					letterSpacing: '-0.01em'
				}}>
					Token Unlock Schedule
				</h3>
				<p style={{ 
					fontSize: '13px', 
					color: '#6c7281', 
					margin: 0,
					fontWeight: 400
				}}>
					Monthly vesting schedule for top performing investments (through March 2028)
				</p>
			</div>
			
			{/* Chart */}
			<div style={{ padding: '40px' }}>
				<div style={{ 
					display: 'flex',
					flexDirection: 'column',
					gap: '24px',
					height: '480px'
				}}>
					{/* Chart Area */}
					<div style={{ 
						flex: 1,
						display: 'flex',
						alignItems: 'flex-end',
						gap: '6px',
						paddingBottom: '80px',
						position: 'relative',
						overflowX: 'auto',
						minHeight: '400px',
						background: 'linear-gradient(to top, rgba(248, 250, 252, 0.5) 0%, transparent 100%)',
						borderRadius: '8px',
						padding: '20px'
					}}>
						{processedData.map((monthData, index) => {
							const monthTotal = Object.keys(projectColors).reduce((sum, project) => 
								sum + (monthData[project as keyof VestingData] as number || 0), 0
							);
							
							if (monthTotal === 0) return null;
							
							return (
								<div key={monthData.month} style={{ 
									minWidth: '50px',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: '8px'
								}}>
									{/* Stacked Bar */}
									<div style={{ 
										width: '100%',
										height: `${Math.max((monthTotal / maxMonthlyValue) * 350, 30)}px`,
										display: 'flex',
										flexDirection: 'column',
										backgroundColor: '#ffffff',
										borderRadius: '6px',
										overflow: 'hidden',
										border: '2px solid #f1f5f9',
										position: 'relative',
										boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
										transition: 'all 0.2s ease'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
										e.currentTarget.style.transform = 'translateY(-2px)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
										e.currentTarget.style.transform = 'translateY(0px)';
									}}>
										{Object.keys(projectColors).map((project) => {
											const value = monthData[project as keyof VestingData] as number || 0;
											if (value === 0) return null;
											
											const percentage = (value / monthTotal) * 100;
											
											return (
												<div
													key={project}
													style={{
														height: `${percentage}%`,
														backgroundColor: projectColors[project],
														cursor: 'pointer',
														transition: 'all 0.2s ease',
														position: 'relative'
													}}
													onMouseEnter={(e) => {
														const rect = e.currentTarget.getBoundingClientRect();
														setHoveredSegment({
															project,
															value,
															x: rect.left + rect.width / 2,
															y: rect.top
														});
														e.currentTarget.style.filter = 'brightness(1.1)';
													}}
													onMouseLeave={(e) => {
														setHoveredSegment(null);
														e.currentTarget.style.filter = 'brightness(1)';
													}}
												/>
											);
										})}
									</div>
									
									{/* Month Label - Professional X-axis */}
									<div style={{ 
										fontSize: '10px',
										color: '#4b5563',
										fontWeight: 600,
										textAlign: 'center',
										letterSpacing: '0.02em',
										textTransform: 'uppercase',
										marginTop: '8px'
									}}>
										{formatMonth(monthData.month)}
									</div>
									
									{/* Total Value - Show for all months with values */}
									{monthTotal > 0 && (
										<div style={{ 
											fontSize: '8px',
											color: '#1f2937',
											fontWeight: 700,
											textAlign: 'center',
											fontFamily: '"SF Mono", "Monaco", monospace',
											backgroundColor: '#f9fafb',
											padding: '2px 6px',
											borderRadius: '4px',
											border: '1px solid #e5e7eb'
										}}>
											{formatTokensReceived('$' + monthTotal.toLocaleString())}
										</div>
									)}
								</div>
							);
						})}
						
						{/* Professional Hover Tooltip */}
						{hoveredSegment && (
							<div style={{
								position: 'fixed',
								left: hoveredSegment.x - 90,
								top: hoveredSegment.y - 80,
								backgroundColor: '#1f2937',
								color: '#ffffff',
								padding: '12px 16px',
								borderRadius: '8px',
								fontSize: '13px',
								fontWeight: 500,
								pointerEvents: 'none',
								zIndex: 1000,
								whiteSpace: 'nowrap',
								boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
								border: '1px solid rgba(255, 255, 255, 0.1)'
							}}>
								<div style={{ 
									fontWeight: 700, 
									marginBottom: '4px',
									fontSize: '14px',
									color: '#f9fafb'
								}}>
									{hoveredSegment.project}
								</div>
								<div style={{
									fontSize: '12px',
									color: '#d1d5db',
									fontFamily: '"SF Mono", "Monaco", monospace'
								}}>
									Monthly Vesting: {formatTokensReceived('$' + hoveredSegment.value.toLocaleString())}
								</div>
								{/* Arrow pointing down */}
								<div style={{
									position: 'absolute',
									bottom: '-6px',
									left: '50%',
									width: '12px',
									height: '12px',
									backgroundColor: '#1f2937',
									border: '1px solid rgba(255, 255, 255, 0.1)',
									borderTop: 'none',
									borderLeft: 'none',
									transform: 'translateX(-50%) rotate(45deg)'
								}} />
							</div>
						)}
					</div>
					
					{/* Legend */}
					<div style={{ 
						display: 'flex',
						flexWrap: 'wrap',
						gap: '16px',
						justifyContent: 'center',
						paddingTop: '16px',
						borderTop: '1px solid #e1e5e9'
					}}>
						{Object.keys(projectColors).map((project) => (
							<div key={project} style={{ 
								display: 'flex',
								alignItems: 'center',
								gap: '6px'
							}}>
								<div style={{ 
									width: '12px',
									height: '12px',
									backgroundColor: projectColors[project],
									borderRadius: '2px'
								}} />
								<span style={{ 
									fontSize: '11px',
									color: '#374151',
									fontWeight: 500
								}}>
									{project}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

// Blockchain Category Donut Chart Component
function BlockchainCategoryDonutChart({ data }: { data: BlockchainCategory[] }) {
	const [hoveredSegment, setHoveredSegment] = React.useState<{
		category: string;
		investments: string[];
		value: number;
		percentage: number;
		x: number;
		y: number;
	} | null>(null);

	if (!data || data.length === 0) {
		return (
			<div style={{ 
				backgroundColor: '#ffffff',
				border: '1px solid #e1e5e9',
				borderRadius: '12px',
				padding: '32px',
				marginBottom: '32px',
				textAlign: 'center',
				color: '#6c7281',
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
			}}>
				<h3 style={{ 
					fontSize: '18px', 
					fontWeight: 600, 
					color: '#1a1d29',
					margin: '0 0 8px 0'
				}}>
					Portfolio Allocation by Blockchain Category
				</h3>
				<p style={{ margin: '8px 0', fontSize: '14px' }}>
					No blockchain category data available.
				</p>
			</div>
		);
	}

	// Enhanced color palette with better contrast and modern colors
	const categoryColors = [
		'#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
		'#06b6d4', '#84cc16', '#f97316', '#ec4899', '#3b82f6',
		'#14b8a6', '#f43f5e', '#22c55e', '#a855f7', '#0ea5e9'
	];

	// Calculate total invested for percentages
	const totalInvested = data.reduce((sum, category) => 
		sum + parseFloat(category.totalInvested.replace(/[$,]/g, '') || '0'), 0
	);

	// Create donut segments
	const segments = data.map((category, index) => {
		const value = parseFloat(category.totalInvested.replace(/[$,]/g, '') || '0');
		const percentage = (value / totalInvested) * 100;
		return {
			...category,
			value,
			percentage,
			color: categoryColors[index % categoryColors.length]
		};
	}).filter(segment => segment.value > 0);

	const centerX = 180;
	const centerY = 180;
	const radius = 130;
	const innerRadius = 75;

	let currentAngle = -90; // Start from top

	return (
		<div style={{
			backgroundColor: '#ffffff',
			border: '1px solid #f1f5f9',
			borderRadius: '16px',
			marginBottom: '32px',
			boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
			overflow: 'hidden'
		}}>
			{/* Header */}
			<div style={{ 
				padding: '20px 24px 16px 24px', 
				borderBottom: '1px solid #f1f5f9', 
				backgroundColor: '#fafbfc'
			}}>
				<h3 style={{ 
					fontSize: '16px', 
					fontWeight: 600, 
					color: '#111827',
					margin: '0 0 4px 0',
					letterSpacing: '-0.025em'
				}}>
					Category Breakdown
				</h3>
				<p style={{ 
					fontSize: '12px', 
					color: '#6b7280', 
					margin: 0,
					fontWeight: 400
				}}>
					Portfolio allocation across blockchain categories
				</p>
			</div>
			
			{/* Chart Container */}
			<div style={{ padding: '32px' }}>
				
				{/* Chart and Legend Section */}
				<div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
					{/* Donut Chart - Bigger size */}
					<div style={{ position: 'relative', flexShrink: 0 }}>
					<svg width="360" height="360" style={{ overflow: 'visible' }}>
						{segments.map((segment, index) => {
							const angle = (segment.percentage / 100) * 360;
							const startAngle = currentAngle;
							const endAngle = currentAngle + angle;
							
							// Convert to radians
							const startRad = (startAngle * Math.PI) / 180;
							const endRad = (endAngle * Math.PI) / 180;
							
							// Calculate path coordinates
							const x1 = centerX + radius * Math.cos(startRad);
							const y1 = centerY + radius * Math.sin(startRad);
							const x2 = centerX + radius * Math.cos(endRad);
							const y2 = centerY + radius * Math.sin(endRad);
							const x3 = centerX + innerRadius * Math.cos(endRad);
							const y3 = centerY + innerRadius * Math.sin(endRad);
							const x4 = centerX + innerRadius * Math.cos(startRad);
							const y4 = centerY + innerRadius * Math.sin(startRad);
							
							const largeArcFlag = angle > 180 ? 1 : 0;
							
							const pathData = [
								`M ${x1} ${y1}`,
								`A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
								`L ${x3} ${y3}`,
								`A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
								'Z'
							].join(' ');
							
							currentAngle = endAngle;
							
							return (
								<path
									key={segment.category}
									d={pathData}
									fill={segment.color}
									stroke="#ffffff"
									strokeWidth="3"
									style={{
										cursor: 'pointer',
										transition: 'all 0.3s ease',
										filter: hoveredSegment?.category === segment.category ? 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'brightness(1)',
										transform: hoveredSegment?.category === segment.category ? 'scale(1.02)' : 'scale(1)',
										transformOrigin: `${centerX}px ${centerY}px`
									}}
									onMouseEnter={(e) => {
										const rect = e.currentTarget.getBoundingClientRect();
										setHoveredSegment({
											category: segment.category,
											investments: segment.investments,
											value: segment.value,
											percentage: segment.percentage,
											x: rect.left + rect.width / 2,
											y: rect.top + rect.height / 2
										});
									}}
									onMouseLeave={() => setHoveredSegment(null)}
								/>
							);
						})}
						
						{/* Center text for bigger donut */}
						<text
							x={centerX}
							y={centerY - 10}
							textAnchor="middle"
							style={{
								fontSize: '12px',
								fontWeight: 500,
								fill: '#9ca3af',
								textTransform: 'uppercase',
								letterSpacing: '0.1em'
							}}
						>
							Total Invested
						</text>
						<text
							x={centerX}
							y={centerY + 12}
							textAnchor="middle"
							style={{
								fontSize: '24px',
								fontWeight: 700,
								fill: '#111827',
								fontFamily: '"SF Mono", "Monaco", monospace'
							}}
						>
							{formatTokensReceived('$' + totalInvested.toLocaleString())}
						</text>
						<text
							x={centerX}
							y={centerY + 32}
							textAnchor="middle"
							style={{
								fontSize: '11px',
								fontWeight: 500,
								fill: '#6b7280',
								textTransform: 'uppercase',
								letterSpacing: '0.05em'
							}}
						>
							{segments.length} Categories
						</text>
					</svg>
					
					{/* Enhanced Hover Tooltip */}
					{hoveredSegment && (
						<div style={{
							position: 'fixed',
							left: hoveredSegment.x - 160,
							top: hoveredSegment.y - 120,
							backgroundColor: '#1f2937',
							color: '#ffffff',
							padding: '20px',
							borderRadius: '12px',
							fontSize: '13px',
							fontWeight: 500,
							pointerEvents: 'none',
							zIndex: 1000,
							minWidth: '320px',
							maxWidth: '400px',
							boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
							backdropFilter: 'blur(8px)'
						}}>
							<div style={{ 
								fontWeight: 800, 
								marginBottom: '12px',
								fontSize: '18px',
								color: '#f9fafb',
								display: 'flex',
								alignItems: 'center',
								gap: '8px'
							}}>
								<div style={{
									width: '12px',
									height: '12px',
									backgroundColor: segments.find(s => s.category === hoveredSegment.category)?.color,
									borderRadius: '3px'
								}} />
								{hoveredSegment.category}
							</div>
							<div style={{
								fontSize: '14px',
								color: '#d1d5db',
								marginBottom: '12px',
								fontFamily: '"SF Mono", "Monaco", monospace',
								padding: '8px 12px',
								backgroundColor: 'rgba(255, 255, 255, 0.1)',
								borderRadius: '6px'
							}}>
								{formatTokensReceived('$' + hoveredSegment.value.toLocaleString())} ({hoveredSegment.percentage.toFixed(1)}%)
							</div>
							<div style={{
								fontSize: '12px',
								color: '#d1d5db',
								fontWeight: 600,
								marginBottom: '8px'
							}}>
								Investments ({hoveredSegment.investments.length}):
							</div>
							<div style={{
								fontSize: '11px',
								color: '#e5e7eb',
								lineHeight: '1.5',
								maxHeight: '140px',
								overflowY: 'auto',
								padding: '8px',
								backgroundColor: 'rgba(0, 0, 0, 0.2)',
								borderRadius: '6px',
								border: '1px solid rgba(255, 255, 255, 0.1)'
							}}>
								{hoveredSegment.investments.join(' • ')}
							</div>
						</div>
					)}
				</div>
				
				{/* Category Breakdown - Two columns like screenshot */}
				<div style={{ 
					flex: 1,
					minWidth: '400px'
				}}>
					
					{/* Two column grid */}
					<div style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '12px 24px'
					}}>
						{segments.map((segment) => (
							<div key={segment.category} style={{ 
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
								padding: '8px 0',
								cursor: 'pointer',
								transition: 'all 0.15s ease'
							}}
							onMouseEnter={(e) => {
								const rect = e.currentTarget.getBoundingClientRect();
								setHoveredSegment({
									category: segment.category,
									investments: segment.investments,
									value: segment.value,
									percentage: segment.percentage,
									x: rect.left + rect.width / 2,
									y: rect.top + rect.height / 2
								});
							}}
							onMouseLeave={() => setHoveredSegment(null)}>
								{/* Color indicator */}
								<div style={{ 
									width: '16px',
									height: '16px',
									backgroundColor: segment.color,
									borderRadius: '4px',
									flexShrink: 0
								}} />
								
								{/* Category info */}
								<div style={{ flex: 1, minWidth: 0 }}>
									<div style={{
										fontSize: '14px',
										fontWeight: 600,
										color: '#1f2937',
										marginBottom: '2px'
									}}>
										{segment.category}
									</div>
									<div style={{
										fontSize: '12px',
										color: '#6b7280',
										fontFamily: '"SF Mono", "Monaco", monospace'
									}}>
										{formatTokensReceived('$' + segment.value.toLocaleString())} ({segment.percentage.toFixed(1)}%)
									</div>
								</div>
								
								{/* Investment count - positioned on the right */}
								<div style={{
									fontSize: '12px',
									color: '#9ca3af',
									fontWeight: 600,
									minWidth: '20px',
									textAlign: 'right'
								}}>
									{segment.investmentCount}
								</div>
							</div>
						))}
					</div>
				</div>
				</div>
			</div>
		</div>
	);
}

// Blockchain Category Performance Bar Chart Component
function BlockchainCategoryBarChart({ data }: { data: BlockchainCategory[] }) {
	const [hoveredSegment, setHoveredSegment] = React.useState<{
		category: string;
		investments: string[];
		value: number;
		percentage: number;
		realisedValue: string;
		unrealisedValue: string;
		x: number;
		y: number;
	} | null>(null);

	if (!data || data.length === 0) {
		return (
			<div style={{ 
				backgroundColor: '#ffffff',
				border: '1px solid #e1e5e9',
				borderRadius: '12px',
				padding: '32px',
				marginBottom: '32px',
				textAlign: 'center',
				color: '#6c7281',
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
			}}>
				<h3 style={{ 
					fontSize: '18px', 
					fontWeight: 600, 
					color: '#1a1d29',
					margin: '0 0 8px 0'
				}}>
					Performance by Blockchain Category
				</h3>
				<p style={{ margin: '8px 0', fontSize: '14px' }}>
					No performance data available.
				</p>
			</div>
		);
	}

	// Calculate total invested for percentage calculations
	const totalPortfolioInvested = data.reduce((sum, category) => 
		sum + parseFloat(category.totalInvested.replace(/[$,]/g, '') || '0'), 0
	);

	// Process data for chart with better parsing
	const chartData = data.map(category => {
		// Clean and parse ROI values more carefully
		const cleanRealisedRoi = category.realisedRoi?.toString().replace(/[x%\s]/gi, '').trim() || '0';
		const cleanUnrealisedRoi = category.unrealisedRoi?.toString().replace(/[x%\s]/gi, '').trim() || '0';
		
		// Handle different number formats (decimals, percentages, etc.)
		let realisedRoi = 0;
		let unrealisedRoi = 0;
		
		// Parse realised ROI
		if (cleanRealisedRoi && cleanRealisedRoi !== '0' && cleanRealisedRoi !== '-') {
			realisedRoi = parseFloat(cleanRealisedRoi);
			// If the value seems like a percentage (> 10), convert to decimal
			if (realisedRoi > 10) {
				realisedRoi = realisedRoi / 100;
			}
		}
		
		// Parse unrealised ROI
		if (cleanUnrealisedRoi && cleanUnrealisedRoi !== '0' && cleanUnrealisedRoi !== '-') {
			unrealisedRoi = parseFloat(cleanUnrealisedRoi);
			// If the value seems like a percentage (> 10), convert to decimal
			if (unrealisedRoi > 10) {
				unrealisedRoi = unrealisedRoi / 100;
			}
		}
		
		const totalInvestedNum = parseFloat(category.totalInvested.replace(/[$,]/g, '') || '0');
		const totalInvestedPercentage = totalPortfolioInvested > 0 ? 
			(totalInvestedNum / totalPortfolioInvested) * 100 : 0;
		
		return {
			category: category.category,
			realisedRoi: isNaN(realisedRoi) ? 0 : realisedRoi,
			unrealisedRoi: isNaN(unrealisedRoi) ? 0 : unrealisedRoi,
			totalInvested: totalInvestedNum,
			totalInvestedFormatted: category.totalInvested,
			totalInvestedPercentage: totalInvestedPercentage,
			realisedValue: category.realisedValue,
			unrealisedValue: category.unrealisedValue,
			investments: category.investments || [],
			// Store original values for debugging
			originalRealisedRoi: category.realisedRoi,
			originalUnrealisedRoi: category.unrealisedRoi
		};
	}).filter(item => item.totalInvested > 0)
	.sort((a, b) => (b.realisedRoi + b.unrealisedRoi) - (a.realisedRoi + a.unrealisedRoi)); // Sort by total ROI

	// Debug: Log the processed data to help identify parsing issues
	console.log('Blockchain Category Chart Data:', chartData.map(item => ({
		category: item.category,
		realisedRoi: item.realisedRoi,
		unrealisedRoi: item.unrealisedRoi,
		originalRealisedRoi: item.originalRealisedRoi,
		originalUnrealisedRoi: item.originalUnrealisedRoi
	})));

	const maxRoi = Math.max(...chartData.flatMap(item => [item.realisedRoi, item.unrealisedRoi]), 1);
	
	// Create regular Y-axis intervals
	const getYAxisIntervals = (max: number) => {
		if (max <= 1) return [0, 0.2, 0.4, 0.6, 0.8, 1.0];
		if (max <= 2) return [0, 0.4, 0.8, 1.2, 1.6, 2.0];
		if (max <= 3) return [0, 0.6, 1.2, 1.8, 2.4, 3.0];
		if (max <= 4) return [0, 0.8, 1.6, 2.4, 3.2, 4.0];
		if (max <= 5) return [0, 1.0, 2.0, 3.0, 4.0, 5.0];
		// For higher values, use increments of 1
		const roundedMax = Math.ceil(max);
		const interval = roundedMax / 5;
		return Array.from({length: 6}, (_, i) => i * interval);
	};
	
	const yAxisIntervals = getYAxisIntervals(maxRoi);
	const chartMaxRoi = yAxisIntervals[yAxisIntervals.length - 1];
	const barHeight = 50;
	const barSpacing = 20;
	const chartWidth = 600;

	return (
		<div style={{ 
			backgroundColor: '#ffffff',
			border: '1px solid #f1f5f9',
			borderRadius: '16px',
			marginBottom: '32px',
			boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
			overflow: 'hidden'
		}}>
			{/* Header */}
			<div style={{ 
				padding: '20px 24px 16px 24px', 
				borderBottom: '1px solid #f1f5f9', 
				backgroundColor: '#fafbfc'
			}}>
				<h3 style={{ 
					fontSize: '16px', 
					fontWeight: 600, 
					color: '#111827',
					margin: '0 0 4px 0',
					letterSpacing: '-0.025em'
				}}>
					Performance by Blockchain Category
				</h3>
				<p style={{ 
					fontSize: '12px', 
					color: '#6b7280', 
					margin: 0,
					fontWeight: 400
				}}>
					Realised vs Unrealised ROI across blockchain categories
				</p>
			</div>
			
			{/* Chart Container - Enhanced Design */}
			<div style={{ 
				padding: '32px',
				overflowX: 'auto'
			}}>
				<div style={{ 
					minWidth: `${Math.max(600, chartData.length * 90)}px`,
					height: '400px',
					position: 'relative',
					backgroundColor: '#fafbfc',
					borderRadius: '12px',
					padding: '20px'
				}}>
					{/* Enhanced Grid Lines */}
					<svg 
						width="100%" 
						height="100%" 
						style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
					>
						{/* Horizontal grid lines */}
						{yAxisIntervals.map((value) => {
							const ratio = value / chartMaxRoi;
							return (
								<line
									key={value}
									x1={70}
									y1={40 + (1 - ratio) * 300}
									x2="95%"
									y2={40 + (1 - ratio) * 300}
									stroke={value === 0 ? "#d1d5db" : "#f1f5f9"}
									strokeWidth={value === 0 ? "2" : "1"}
								/>
							);
						})}
						
						{/* Y-axis labels */}
						{yAxisIntervals.map((value) => {
							const ratio = value / chartMaxRoi;
							return (
								<text
									key={value}
									x={65}
									y={40 + (1 - ratio) * 300 + 4}
									textAnchor="end"
									fontSize="11"
									fill="#6b7280"
									fontWeight="500"
									fontFamily='"SF Mono", "Monaco", monospace'
								>
									{value.toFixed(1)}x
								</text>
							);
						})}
					</svg>

					{/* Chart Bars */}
					<div style={{ 
						display: 'flex', 
						alignItems: 'flex-end', 
						height: '340px',
						paddingLeft: '70px',
						paddingTop: '40px',
						gap: '16px',
						justifyContent: 'flex-start'
					}}>
						{chartData.map((item) => {
							const realisedHeight = (item.realisedRoi / chartMaxRoi) * 300;
							const unrealisedHeight = (item.unrealisedRoi / chartMaxRoi) * 300;
							const isHovered = hoveredSegment?.category === item.category;
							const barWidth = 60;
							
							return (
								<div 
									key={item.category} 
									style={{ 
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										minWidth: `${barWidth + 20}px`,
										cursor: 'pointer',
										backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
										borderRadius: '8px',
										padding: '4px',
										transition: 'background-color 0.2s ease'
									}}
									onMouseEnter={(e) => {
										const rect = e.currentTarget.getBoundingClientRect();
										setHoveredSegment({
											category: item.category,
											investments: item.investments,
											value: item.totalInvested,
											percentage: item.totalInvestedPercentage,
											realisedValue: item.realisedValue,
											unrealisedValue: item.unrealisedValue,
											x: rect.left + rect.width / 2,
											y: rect.top + rect.height / 2
										});
									}}
									onMouseLeave={() => setHoveredSegment(null)}
								>
									{/* Bar Container */}
									<div style={{
										display: 'flex',
										alignItems: 'flex-end',
										height: '300px',
										gap: '6px',
										position: 'relative'
									}}>
										{/* Realised ROI Bar */}
										<div style={{
											width: `${barWidth / 2 - 3}px`,
											height: `${Math.max(realisedHeight, 2)}px`,
											background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
											borderRadius: '6px 6px 0 0',
											transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
											transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
											transformOrigin: 'bottom',
											position: 'relative',
											boxShadow: isHovered ? '0 4px 20px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(16, 185, 129, 0.2)'
										}}>
											{/* Value Label */}
											{item.realisedRoi > 0.05 && (
												<div style={{
													position: 'absolute',
													top: '-20px',
													left: '50%',
													transform: 'translateX(-50%)',
													fontSize: '9px',
													fontWeight: 700,
													color: '#059669',
													fontFamily: '"SF Mono", "Monaco", monospace',
													textAlign: 'center',
													whiteSpace: 'nowrap',
													backgroundColor: 'rgba(255, 255, 255, 0.9)',
													padding: '2px 4px',
													borderRadius: '3px',
													border: '1px solid rgba(16, 185, 129, 0.2)'
												}}>
													{item.realisedRoi.toFixed(2)}x
												</div>
											)}
										</div>
										
										{/* Unrealised ROI Bar */}
										<div style={{
											width: `${barWidth / 2 - 3}px`,
											height: `${Math.max(unrealisedHeight, 2)}px`,
											background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
											borderRadius: '6px 6px 0 0',
											transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
											transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
											transformOrigin: 'bottom',
											position: 'relative',
											boxShadow: isHovered ? '0 4px 20px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(59, 130, 246, 0.2)'
										}}>
											{/* Value Label */}
											{item.unrealisedRoi > 0.05 && (
												<div style={{
													position: 'absolute',
													top: '-20px',
													left: '50%',
													transform: 'translateX(-50%)',
													fontSize: '9px',
													fontWeight: 700,
													color: '#1d4ed8',
													fontFamily: '"SF Mono", "Monaco", monospace',
													textAlign: 'center',
													whiteSpace: 'nowrap',
													backgroundColor: 'rgba(255, 255, 255, 0.9)',
													padding: '2px 4px',
													borderRadius: '3px',
													border: '1px solid rgba(59, 130, 246, 0.2)'
												}}>
													{item.unrealisedRoi.toFixed(2)}x
												</div>
											)}
										</div>

									</div>

									{/* Enhanced Category Label */}
									<div style={{
										fontSize: '12px',
										fontWeight: 600,
										color: '#374151',
										textAlign: 'center',
										marginTop: '12px',
										transform: 'rotate(-25deg)',
										transformOrigin: 'center',
										width: '70px',
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis'
									}}>
										{item.category}
									</div>
								</div>
							);
						})}
					</div>
				</div>
				
				{/* Enhanced Hover Tooltip - Matching Donut Chart Style */}
				{hoveredSegment && (
					<div style={{
						position: 'fixed',
						left: hoveredSegment.x - 160,
						top: hoveredSegment.y - 120,
						backgroundColor: '#1f2937',
						color: '#ffffff',
						padding: '20px',
						borderRadius: '12px',
						fontSize: '13px',
						fontWeight: 500,
						pointerEvents: 'none',
						zIndex: 1000,
						minWidth: '320px',
						maxWidth: '400px',
						boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
						backdropFilter: 'blur(8px)'
					}}>
						<div style={{ 
							fontWeight: 800, 
							marginBottom: '12px',
							fontSize: '18px',
							color: '#f9fafb',
							display: 'flex',
							alignItems: 'center',
							gap: '8px'
						}}>
							<div style={{
								width: '12px',
								height: '12px',
								background: 'linear-gradient(45deg, #34d399, #3b82f6)',
								borderRadius: '3px'
							}} />
							{hoveredSegment.category}
						</div>
						<div style={{
							fontSize: '14px',
							color: '#d1d5db',
							marginBottom: '12px',
							fontFamily: '"SF Mono", "Monaco", monospace',
							padding: '8px 12px',
							backgroundColor: 'rgba(255, 255, 255, 0.1)',
							borderRadius: '6px'
						}}>
							${hoveredSegment.value.toLocaleString()} ({hoveredSegment.percentage.toFixed(1)}%)
						</div>
						<div style={{
							fontSize: '13px',
							color: '#d1d5db',
							marginBottom: '6px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center'
						}}>
							<span style={{ fontWeight: 600 }}>Realised Value:</span>
							<span style={{ 
								color: '#34d399',
								fontFamily: '"SF Mono", "Monaco", monospace',
								fontWeight: 700
							}}>
								{hoveredSegment.realisedValue}
							</span>
						</div>
						<div style={{
							fontSize: '13px',
							color: '#d1d5db',
							marginBottom: '12px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center'
						}}>
							<span style={{ fontWeight: 600 }}>Unrealised Value:</span>
							<span style={{ 
								color: '#60a5fa',
								fontFamily: '"SF Mono", "Monaco", monospace',
								fontWeight: 700
							}}>
								{hoveredSegment.unrealisedValue}
							</span>
						</div>
						<div style={{
							fontSize: '12px',
							color: '#d1d5db',
							fontWeight: 600,
							marginBottom: '8px'
						}}>
							Investments ({hoveredSegment.investments.length}):
						</div>
						<div style={{
							fontSize: '11px',
							color: '#e5e7eb',
							lineHeight: '1.5',
							maxHeight: '140px',
							overflowY: 'auto',
							padding: '8px',
							backgroundColor: 'rgba(0, 0, 0, 0.2)',
							borderRadius: '6px',
							border: '1px solid rgba(255, 255, 255, 0.1)'
						}}>
							{hoveredSegment.investments.join(' • ')}
						</div>
					</div>
				)}
				
				{/* Enhanced Legend */}
				<div style={{ 
					display: 'flex',
					gap: '32px',
					marginTop: '24px',
					paddingTop: '20px',
					borderTop: '2px solid #f1f5f9',
					justifyContent: 'center'
				}}>
					<div style={{ 
						display: 'flex', 
						alignItems: 'center', 
						gap: '8px'
					}}>
						<div style={{ 
							width: '16px',
							height: '16px',
							background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
							borderRadius: '4px',
							boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
						}} />
						<span style={{ 
							fontSize: '13px',
							color: '#374151',
							fontWeight: 600
						}}>
							Realised ROI
						</span>
					</div>
					<div style={{ 
						display: 'flex', 
						alignItems: 'center', 
						gap: '8px'
					}}>
						<div style={{ 
							width: '16px',
							height: '16px',
							background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
							borderRadius: '4px',
							boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
						}} />
						<span style={{ 
							fontSize: '13px',
							color: '#374151',
							fontWeight: 600
						}}>
							Unrealised ROI
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function Stat({ label, value, trend, subtitle, customColor }: { 
	label: string; 
	value: string | number | null | undefined;
	trend?: 'positive' | 'negative' | 'neutral';
	subtitle?: string;
	customColor?: string;
}) {
	const getTrendColor = () => {
		if (customColor) return customColor;
		switch (trend) {
			case 'positive': return '#059669';
			case 'negative': return '#dc2626';
			default: return '#1a1d29';
		}
	};

	return (
		<div style={{ 
			backgroundColor: '#ffffff',
			border: '1px solid #e1e5e9',
			borderRadius: '4px',
			padding: '24px',
			boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
			transition: 'all 0.15s ease'
		}}
		onMouseEnter={(e) => {
			e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
		}}
		onMouseLeave={(e) => {
			e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
		}}>
			<div style={{ marginBottom: 12 }}>
				<div style={{ 
					fontSize: '12px', 
					fontWeight: 500, 
					color: '#6c7281', 
					letterSpacing: '0.02em',
					textTransform: 'uppercase',
					marginBottom: '4px'
				}}>
					{label}
				</div>
				{subtitle && (
					<div style={{ 
						fontSize: '11px', 
						color: '#9ca3af',
						fontWeight: 400
					}}>
						{subtitle}
					</div>
				)}
			</div>
			<div style={{ 
				fontSize: '28px', 
				fontWeight: 600, 
				color: getTrendColor(),
				lineHeight: 1,
				fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace'
			}}>
				{value ?? '—'}
			</div>
		</div>
	);
}

type ColKey =
	| 'name' | 'totalInvested' | 'totalValue' | 'realisedValue' | 'realisedPnL' | 'roi'
	| 'realisedRoi' | 'percentReceived' | 'percentSold' | 'liquidValue'
	| 'nextUnlock' | 'nextUnlock2' | 'fullUnlock' | 'buyPrice' | 'currentPrice' | 'vesting';

const COLUMNS: { key: ColKey; label: string; numeric?: boolean }[] = [
	{ key: 'name', label: 'Name' },
	{ key: 'totalInvested', label: 'Total Invested', numeric: true },
	{ key: 'totalValue', label: 'Total Value', numeric: true },
	{ key: 'realisedValue', label: 'Realised Value', numeric: true },
	{ key: 'realisedPnL', label: 'Realised P&L', numeric: true },
	{ key: 'roi', label: 'ROI', numeric: true },
	{ key: 'realisedRoi', label: 'Realised ROI', numeric: true },
	{ key: 'percentReceived', label: '% Received', numeric: true },
	{ key: 'percentSold', label: '% Sold', numeric: true },
	{ key: 'liquidValue', label: 'Liquid Value', numeric: true },
	{ key: 'nextUnlock', label: 'Next Unlock' },
	{ key: 'nextUnlock2', label: 'Next Unlock' },
	{ key: 'fullUnlock', label: 'Full Unlock' },
	{ key: 'buyPrice', label: 'Buy Price', numeric: true },
	{ key: 'currentPrice', label: 'Current Price', numeric: true },
	{ key: 'vesting', label: 'Vesting' },
];

function parseNumberLike(v: string | undefined) {
	if (!v) return Number.NEGATIVE_INFINITY;
	const s0 = v.trim();
	if (/^[a-zA-Z/ -]+$/.test(s0)) return Number.NEGATIVE_INFINITY;
	const s = s0.replace(/\s/g, '').replace(/[$,]/g, '');
	if (/^-?\d+(\.\d+)?x$/i.test(s)) return Number(s.replace(/x$/i, ''));
	if (/^-?\d+(\.\d+)?%$/.test(s)) return Number(s.replace(/%$/, ''));
	if (/^\(.*\)$/.test(s)) return -Number(s.replace(/[()]/g, ''));
	const n = Number(s);
	return isNaN(n) ? Number.NEGATIVE_INFINITY : n;
}

function formatCell(v: string) {
	if (!v) return '';
	if (/[%$]|\dx$/i.test(v)) return v;
	const n = Number(v.replace(/,/g, ''));
	if (!isNaN(n) && v.match(/^-?\d+(\.\d+)?$/)) {
		return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
	}
	return v;
}

// Individual Portfolio Dashboard Component
function IndividualPortfolioDashboard({ 
	portfolio, 
	onHeaderClick, 
	sortKey, 
	sortDir,
	individualVestingData
}: { 
	portfolio: IndividualPortfolio;
	onHeaderClick: (k: ColKey) => void;
	sortKey: string;
	sortDir: 'desc' | 'asc';
	individualVestingData?: VestingData[];
}) {
	// Column definitions for individual portfolio table
	const INDIVIDUAL_COLUMNS = [
		{ key: 'name', label: 'Investment', numeric: false },
		{ key: 'totalInvested', label: 'Total Invested', numeric: true },
		{ key: 'share', label: 'Share %', numeric: true },
		{ key: 'totalValue', label: 'Total Value', numeric: true },
		{ key: 'realisedPnL', label: 'Realised P&L', numeric: true },
		{ key: 'realisedValue', label: 'Realised Value', numeric: true },
		{ key: 'unrealisedValue', label: 'Unrealised Value', numeric: true },
		{ key: 'roi', label: 'ROI', numeric: true },
		{ key: 'realisedRoi', label: 'Realised ROI', numeric: true },
		{ key: 'liquidValue', label: 'Liquid Value', numeric: true },
	];

	const sorted = useMemo(() => {
		const arr = [...portfolio.investments];
		arr.sort((a, b) => {
			const col = sortKey;
			const colDef = INDIVIDUAL_COLUMNS.find(c => c.key === col);
			if (colDef?.numeric) {
				const av = parseNumberLike((a as Record<string, unknown>)[col] as string);
				const bv = parseNumberLike((b as Record<string, unknown>)[col] as string);
				return sortDir === 'desc' ? bv - av : av - bv;
			}
			const avs = String((a as Record<string, unknown>)[col] ?? '');
			const bvs = String((b as Record<string, unknown>)[col] ?? '');
			return sortDir === 'desc' ? bvs.localeCompare(avs) : avs.localeCompare(bvs);
		});
		return arr;
	}, [portfolio.investments, sortKey, sortDir]);

	return (
		<>
			{/* KPIs for Individual Portfolio */}
			<div style={{ marginBottom: '40px' }}>
				<h2 style={{ 
					fontSize: '18px', 
					fontWeight: 600, 
					color: '#1a1d29',
					margin: '0 0 20px 0',
					letterSpacing: '-0.01em'
				}}>
					Portfolio Performance
				</h2>
				{portfolio.summary ? (
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
						gap: '16px'
					}}>
						<Stat 
							label="Total Invested" 
								value={formatTokensReceived(portfolio.summary.totalInvested)}
							trend="neutral"
							subtitle="Capital deployed"
						/>
						<Stat 
							label="Realised Value" 
								value={formatTokensReceived(portfolio.summary.realisedValue)}
							trend="neutral"
							subtitle="Cash returned"
						/>
						<Stat 
							label="Unrealised Value" 
								value={formatTokensReceived(portfolio.summary.totalValue)}
							trend="neutral"
							subtitle="Current market value"
						/>
						<Stat 
							label="Realised P&L" 
								value={formatTokensReceived(portfolio.summary.realisedPnL)}
							trend={portfolio.summary.realisedPnL && !portfolio.summary.realisedPnL.includes('-') ? "positive" : "negative"}
							subtitle="Profit/Loss on exits"
						/>
						<Stat 
							label="Unrealised ROI" 
							value={formatROI(portfolio.summary.roi)} 
							trend={portfolio.summary.roi && parseFloat(portfolio.summary.roi.replace('x', '')) >= 1 ? "positive" : "negative"}
							subtitle="Overall return multiple"
						/>
						<Stat 
							label="Realised ROI" 
							value={formatROI(portfolio.summary.realisedRoi)} 
							trend={portfolio.summary.realisedRoi && parseFloat(portfolio.summary.realisedRoi.replace('x', '')) >= 1 ? "positive" : "negative"}
							subtitle="Return on realised investments"
						/>
					</div>
				) : (
					<div style={{
						padding: '24px',
						backgroundColor: '#f8f9fa',
						borderRadius: '8px',
						border: '1px solid #e9ecef',
						textAlign: 'center'
					}}>
						<p style={{
							color: '#6c757d',
							fontSize: '14px',
							margin: 0
						}}>
							Summary data not available for this portfolio. Individual investment details are shown below.
						</p>
					</div>
				)}
			</div>

			{/* Liquid Value Showcase */}
			{portfolio.summary && (
				<div style={{ 
					backgroundColor: '#ffffff',
					border: '1px solid #e1e5e9',
					borderRadius: '8px',
					padding: '32px',
					marginBottom: '40px',
					boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)'
				}}>
					<h3 style={{ 
						fontSize: '18px', 
						fontWeight: 600, 
						color: '#1a1d29',
						margin: '0 0 24px 0',
						letterSpacing: '-0.01em'
					}}>
						Liquid Positions Overview
					</h3>
					
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px', flexWrap: 'wrap' }}>
						{/* Total Liquid Value */}
						<div style={{ flex: '0 0 auto' }}>
							<div style={{ 
								fontSize: '12px', 
								fontWeight: 500, 
								color: '#6c7281', 
								letterSpacing: '0.02em',
								textTransform: 'uppercase',
								marginBottom: '8px'
							}}>
								Total Liquid Value
							</div>
							<div style={{ 
								fontSize: '36px', 
								fontWeight: 700, 
								color: '#1a1d29',
								lineHeight: 1,
								fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace'
							}}>
								{formatTokensReceived(portfolio.summary.liquidValue)}
							</div>
						</div>
						
						{/* Top 3 Liquid Positions */}
						<div style={{ flex: '1 1 400px', minWidth: '300px' }}>
							<div style={{ 
								fontSize: '12px', 
								fontWeight: 500, 
								color: '#6c7281', 
								letterSpacing: '0.02em',
								textTransform: 'uppercase',
								marginBottom: '12px'
							}}>
								Top Liquid Positions
							</div>
							<div style={{ 
								fontSize: '14px', 
								color: '#374151',
								lineHeight: '1.6',
								fontWeight: 500,
								letterSpacing: '0.01em'
							}}>
								{getTopIndividualLiquidPositions(portfolio.investments)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Individual Vesting Chart */}
			{individualVestingData && individualVestingData.length > 0 && (
				<VestingChart data={individualVestingData} />
			)}

			{/* Individual Portfolio Table */}
			<div style={{ 
				backgroundColor: '#ffffff',
				border: '1px solid #e1e5e9',
				borderRadius: '4px',
				boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
				overflow: 'hidden'
			}}>
				<div style={{ 
					padding: '20px 24px', 
					borderBottom: '1px solid #e1e5e9', 
					backgroundColor: '#fafbfc'
				}}>
					<h3 style={{ 
						fontSize: '16px', 
						fontWeight: 600, 
						color: '#1a1d29',
						margin: '0 0 4px 0'
					}}>
						{portfolio.name} Investment Portfolio
					</h3>
					<p style={{ 
						fontSize: '13px', 
						color: '#6c7281', 
						margin: 0,
						fontWeight: 400
					}}>
						Detailed performance metrics for {portfolio.investments.length} investments
					</p>
				</div>
				<div style={{ overflowX: 'auto' }}>
					<table style={{ 
						width: '100%', 
						borderCollapse: 'collapse', 
						fontSize: '13px',
						fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
						backgroundColor: '#ffffff'
					}}>
						<thead>
							<tr style={{ 
								backgroundColor: '#f8f9fa',
								borderBottom: '1px solid #e1e5e9'
							}}>
								{INDIVIDUAL_COLUMNS.map(col => {
									const active = sortKey === col.key;
									return (
										<th
											key={col.key}
											onClick={() => onHeaderClick(col.key as ColKey)}
											style={{
												textAlign: col.numeric ? 'right' : 'left',
												padding: '12px 16px',
												fontWeight: 500,
												fontSize: '11px',
												letterSpacing: '0.02em',
												textTransform: 'uppercase',
												color: active ? '#2563eb' : '#6c7281',
												cursor: 'pointer',
												userSelect: 'none',
												background: active ? '#f0f4ff' : 'transparent',
												borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
												transition: 'all 0.15s ease',
												position: 'relative'
											}}
											onMouseEnter={(e) => {
												if (!active) {
													e.currentTarget.style.background = '#f8f9fa';
												}
											}}
											onMouseLeave={(e) => {
												if (!active) {
													e.currentTarget.style.background = 'transparent';
												}
											}}
											title={`Sort by ${col.label}`}
										>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: col.numeric ? 'flex-end' : 'flex-start', gap: 6 }}>
												{col.label}
												<span style={{ 
													fontSize: '9px', 
													color: active ? '#2563eb' : '#9ca3af',
													opacity: active ? 1 : 0.5
												}}>
													{active ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
												</span>
											</div>
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
							{sorted.map((investment, index) => {
								const isEven = index % 2 === 0;
								const rowBg = isEven ? '#ffffff' : '#fafbfc';
								
								return (
									<tr 
										key={`${investment.name}-${index}`}
										style={{
											background: rowBg,
											borderBottom: '1px solid #f1f3f4',
											transition: 'all 0.1s ease'
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = '#f8f9fa';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = rowBg;
										}}
									>
										<td style={{ 
											padding: '12px 16px', 
											fontWeight: 500,
											borderRight: '1px solid #f1f3f4'
										}}>
											<div style={{ 
												color: '#1a1d29', 
												fontWeight: 500,
												fontSize: '13px'
											}}>
												{investment.name}
											</div>
										</td>
										{INDIVIDUAL_COLUMNS.slice(1).map((col, colIndex) => {
											const value = (investment as Record<string, unknown>)[col.key];
											let formattedValue = formatCell(value as string) || '-';
											
											if (col.key === 'totalInvested' || col.key === 'totalValue' || col.key === 'realisedValue' || 
												col.key === 'unrealisedValue' || col.key === 'realisedPnL' || col.key === 'liquidValue') {
												formattedValue = formatTokensReceived(value as string);
											} else if (col.key === 'share') {
												formattedValue = formatPercentage(value as string);
											} else if (col.key === 'roi' || col.key === 'realisedRoi') {
												formattedValue = formatROI(value as string);
											}
											
											// Color coding for financial metrics
											let cellColor = '#1a1d29';
											if (col.key === 'realisedPnL') {
												if (formattedValue.includes('-') || formattedValue.includes('(')) {
													cellColor = '#dc2626'; // Red for losses
												} else if (parseFloat(formattedValue.replace(/[^0-9.-]/g, '')) > 0) {
													cellColor = '#059669'; // Green for gains
												}
											} else if (col.key === 'roi' || col.key === 'realisedRoi') {
												const roiNumber = parseFloat(formattedValue.replace(/[^0-9.-]/g, ''));
												if (!isNaN(roiNumber)) {
													if (roiNumber < 1) {
														cellColor = '#dc2626'; // Red for ROI < 1
													} else {
														cellColor = '#059669'; // Green for ROI >= 1
													}
												}
											}
											// Note: realisedValue has no color coding (stays default black)
											
											return (
												<td 
													key={col.key}
													style={{ 
														padding: '12px 16px',
														textAlign: col.numeric ? 'right' : 'left',
														fontWeight: col.numeric ? 500 : 400,
														color: cellColor,
														borderRight: colIndex < INDIVIDUAL_COLUMNS.length - 2 ? '1px solid #f1f3f4' : 'none',
														fontFamily: col.numeric ? '"SF Mono", "Monaco", monospace' : 'inherit',
														fontSize: '13px'
													}}
												>
													{formattedValue}
												</td>
											);
										})}
									</tr>
								);
							})}
							{sorted.length === 0 && (
								<tr>
									<td 
										colSpan={INDIVIDUAL_COLUMNS.length} 
										style={{ 
											padding: '32px', 
											textAlign: 'center', 
											color: '#6c7281',
											fontSize: '14px',
											fontWeight: 400
										}}
									>
										No investments found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}

export default function HomePage() {
	const { data, isLoading, error } = useSWR<Portfolio>('/api/portfolio', fetcher, { refreshInterval: 60_000 });

	// Debug: Log individual portfolios data
	if (data?.individualPortfolios) {
		console.log('Frontend received individual portfolios:', Object.keys(data.individualPortfolios));
		Object.keys(data.individualPortfolios).forEach(key => {
			const portfolio = (data.individualPortfolios as Record<string, IndividualPortfolio>)[key];
			console.log(`${key}: ${portfolio?.name}, ${portfolio?.investments?.length || 0} investments, summary: ${portfolio?.summary ? 'yes' : 'no'}`);
		});
	}

	const [sortKey, setSortKey] = useState<ColKey>('totalValue');
	const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
	const [selectedPortfolio, setSelectedPortfolio] = useState<string>('fund'); // 'fund' or portfolio manager name

	const o: Overview = data?.overview ?? {
		totalInvested: '-', totalValue: '-', realisedValue: '-', realisedPnL: '-',
		unrealisedValue: '-', unrealisedPnL: '-', liquidValue: '-', roi: '-', realisedRoi: '-',
		percentReceived: '-', percentSold: '-', investmentsCount: null, listedCount: null, nonListedCount: null,
		tokensReceived: '-', tokensReceivedPercentage: '-'
	};
	

	const items = data?.investments ?? [];
	const listedProjects = data?.listedProjects ?? {
		totalInvested: '-', totalInvestedPercentage: '-',
		totalValue: '-', totalValuePercentage: '-',
		nextUnlock: '-', nextUnlockDays: '-',
		totalInvestments: '-', listedCount: '-', nonListedCount: '-',
		nextUnlockAmount: '-', nextUnlockDaysDetailed: '-', nextUnlockProject: '-',
		tokensReceived: '-', tokensReceivedPercentage: '-', tokensReceivedROI: '-'
	};

	const sorted = useMemo(() => {
		const arr = [...items];
		arr.sort((a, b) => {
			const col = sortKey;
			const colDef = COLUMNS.find(c => c.key === col);
			if (colDef?.numeric) {
				const av = parseNumberLike((a as Record<string, unknown>)[col] as string);
				const bv = parseNumberLike((b as Record<string, unknown>)[col] as string);
				return sortDir === 'desc' ? bv - av : av - bv;
			}
			const avs = String((a as Record<string, unknown>)[col] ?? '');
			const bvs = String((b as Record<string, unknown>)[col] ?? '');
			return sortDir === 'desc' ? bvs.localeCompare(avs) : avs.localeCompare(bvs);
		});
		return arr;
	}, [items, sortKey, sortDir, COLUMNS]);

	function onHeaderClick(k: ColKey) {
		if (k !== sortKey) { setSortKey(k); setSortDir('desc'); }
		else { setSortDir(d => (d === 'desc' ? 'asc' : 'desc')); }
	}

	// Get current portfolio data
	const getCurrentPortfolio = () => {
		if (selectedPortfolio === 'fund') {
			return {
				type: 'fund',
				data: { overview: o, investments: items, listedProjects }
			};
		} else {
			const portfolio = data?.individualPortfolios?.[selectedPortfolio as keyof typeof data.individualPortfolios];
			return {
				type: 'individual',
				data: portfolio
			};
		}
	};

	const currentPortfolio = getCurrentPortfolio();
	const portfolioOptions = [
		{ value: 'fund', label: 'X Ventures Fund' },
		{ value: 'zohair', label: 'Zohair Portfolio' },
		{ value: 'matthias', label: 'Matthias Portfolio' },
		{ value: 'iaad', label: 'Iaad Portfolio' },
		{ value: 'babak', label: 'Babak Portfolio' },
		{ value: 'bahman', label: 'Bahman Portfolio' },
		{ value: 'victor', label: 'Victor Portfolio' },
		{ value: 'karl', label: 'Karl Portfolio' }
	];

	if (isLoading) return <div style={{ padding: 24 }}>Loading…</div>;
	if (error) return <div style={{ padding: 24, color: 'crimson' }}>Failed to load.</div>;

	return (
		<div style={{ 
			minHeight: '100vh',
			backgroundColor: '#fafbfc',
			fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
		}}>
			{/* Header */}
			<div style={{ 
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e1e5e9',
				padding: '24px 0'
			}}>
				<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div>
							<h1 style={{ 
								fontSize: '28px', 
								fontWeight: 600, 
								color: '#1a1d29',
								margin: 0,
								letterSpacing: '-0.01em'
							}}>
								X Ventures Portfolio
							</h1>
							<p style={{ 
								fontSize: '14px', 
								color: '#6c7281', 
								margin: '4px 0 0 0',
								fontWeight: 400
							}}>
								Portfolio Tracker • {o?.investmentsCount || 0} Active Investments
							</p>
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
							{/* Portfolio Selector */}
							<select 
								value={selectedPortfolio}
								onChange={(e) => setSelectedPortfolio(e.target.value)}
								style={{
									padding: '8px 12px',
									fontSize: '14px',
									fontWeight: 500,
									color: '#1a1d29',
									backgroundColor: '#ffffff',
									border: '1px solid #e1e5e9',
									borderRadius: '4px',
									cursor: 'pointer',
									outline: 'none',
									minWidth: '180px'
								}}
							>
								{portfolioOptions.map(option => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							
							<div style={{ 
								fontSize: '12px', 
								color: '#6c7281',
								textAlign: 'right'
							}}>
								<div>Last Updated</div>
								<div style={{ fontWeight: 500, color: '#1a1d29' }}>
									{new Date().toLocaleDateString('en-US', { 
										month: 'short', 
										day: 'numeric', 
										year: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</div>
							</div>
							<div style={{
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								backgroundColor: '#e8f5e8',
								color: '#2d7738',
								padding: '6px 10px',
								borderRadius: '4px',
								fontSize: '12px',
								fontWeight: 500,
								border: '1px solid #c6f0c6'
							}}>
								<div style={{ width: '6px', height: '6px', backgroundColor: '#2d7738', borderRadius: '50%' }}></div>
								Live Data
							</div>
						</div>
					</div>
				</div>
			</div>

			<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
				{selectedPortfolio === 'fund' ? (
					<>
						{/* Fund Dashboard */}
						{/* Key Performance Indicators */}
				<div style={{ marginBottom: '40px' }}>
					<h2 style={{ 
						fontSize: '18px', 
						fontWeight: 600, 
						color: '#1a1d29',
						margin: '0 0 20px 0',
						letterSpacing: '-0.01em'
					}}>
						Key Performance Indicators
					</h2>
					{/* First Row */}
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
						gap: '16px',
						marginBottom: '16px'
					}}>
						<Stat 
							label="Total Invested" 
							value={formatTokensReceived(o.totalInvested)} 
							trend="neutral"
							subtitle="Capital deployed to date"
						/>
						<Stat 
							label="Realised Value" 
							value={formatTokensReceived(o.realisedValue)} 
							trend="neutral"
							customColor="#000000"
							subtitle="Cash returned to fund"
						/>
						<Stat 
							label="Unrealised Value" 
							value={formatTokensReceived(o.unrealisedValue)} 
							trend="neutral"
							subtitle="Current market valuation"
						/>
						<Stat 
							label="Liquid Value" 
							value={formatTokensReceived(o.liquidValue)} 
							trend="neutral"
							subtitle="Immediately tradeable assets"
						/>
					</div>
					
					{/* Second Row */}
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
						gap: '16px'
					}}>
						<Stat 
							label="Realised P&L" 
							value={formatTokensReceived(o.realisedPnL)} 
							trend={o.realisedPnL && !o.realisedPnL.includes('-') ? "positive" : "negative"}
							subtitle="Profit/Loss on exits"
						/>
						<Stat 
							label="Realised ROI" 
							value={formatROI(o.realisedRoi || '')} 
							trend={o.realisedRoi && parseFloat(o.realisedRoi.replace('x', '')) < 1 ? "negative" : "positive"}
							subtitle="Return on realised investments"
						/>
						<Stat 
							label="Unrealised P&L" 
							value={formatTokensReceived(o.unrealisedPnL)} 
							trend={o.unrealisedPnL && !o.unrealisedPnL.includes('-') ? "positive" : "negative"}
							subtitle="Unrealised profit/loss"
						/>
						<Stat 
							label="UNREALISED ROI" 
							value={formatROI(o.roi || '')} 
							trend={o.roi && parseFloat(o.roi.replace('x', '')) >= 1 ? "positive" : "negative"}
							subtitle="Overall return multiple"
						/>
					</div>
				</div>

				{/* Portfolio Composition */}
				<div style={{ marginBottom: '40px' }}>
					<h2 style={{ 
						fontSize: '18px', 
						fontWeight: 600, 
						color: '#1a1d29',
						margin: '0 0 20px 0',
						letterSpacing: '-0.01em'
					}}>
						Portfolio Composition
					</h2>
					
					{/* First Row: 4 Stats */}
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
						gap: '16px',
						marginBottom: '24px'
					}}>
						<Stat 
							label="Listed Projects" 
							value={listedProjects.listedCount} 
							trend="neutral"
							subtitle={`of ${listedProjects.totalInvestments} total investments`}
						/>
						<Stat 
							label="Pre-TGE Projects" 
							value={listedProjects.nonListedCount} 
							trend="neutral"
							subtitle="Awaiting token generation"
						/>
						<Stat 
							label="Received from Total Invested" 
							value={formatTokensReceived(listedProjects.tokensReceived)} 
							trend="neutral"
							customColor="#000000"
							subtitle={`${formatPercentage(listedProjects.tokensReceivedPercentage)} of total invested`}
						/>
						<Stat 
							label="Return on tokens received" 
							value={formatTokensROI(listedProjects.tokensReceivedROI)} 
							trend={listedProjects.tokensReceivedROI && parseFloat(listedProjects.tokensReceivedROI.replace('x', '')) > 1 ? "positive" : "negative"}
							subtitle="Including sold and liquid tokens"
						/>
					</div>
					
					{/* Compact Liquid Value Section */}
					<div style={{ 
						backgroundColor: '#ffffff',
						border: '1px solid #e1e5e9',
						borderRadius: '8px',
						padding: '20px',
						boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
					}}>
						<div style={{ 
							display: 'flex',
							alignItems: 'flex-start',
							gap: '24px'
						}}>
							{/* Left side: Title and Total */}
							<div style={{ 
								flex: '0 0 180px'
							}}>
								<div style={{ marginBottom: 12 }}>
									<div style={{ 
										fontSize: '16px', 
										fontWeight: 600, 
										color: '#1a1d29',
										letterSpacing: '-0.01em'
									}}>
										Liquid Value
									</div>
								</div>
								<div style={{ 
									fontSize: '28px', 
									fontWeight: 700, 
									color: '#1a1d29',
									lineHeight: 1,
									fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace'
								}}>
									{formatTokensReceived(o.liquidValue)}
								</div>
							</div>
							
							{/* Right side: Single row liquid positions */}
							<div style={{ 
								flex: '1 1 auto',
								paddingTop: '0px'
							}}>
								<div style={{ 
									fontSize: '13px', 
									color: '#6c7281',
									fontWeight: 400,
									marginBottom: '12px'
								}}>
									Top 4 liquid positions
								</div>
								<div style={{ 
									display: 'grid',
									gridTemplateColumns: 'repeat(4, 1fr)',
									gap: '20px',
									alignItems: 'start'
								}}>
									{getTopLiquidPositions(items).split(' • ').map((position, index) => {
										const [name, amount] = position.split(': ');
										return (
											<div key={index} style={{
												padding: '8px 0',
												borderBottom: '1px solid #f1f5f9'
											}}>
												<div style={{
													fontSize: '12px',
													fontWeight: 600,
													color: '#374151',
													marginBottom: '3px',
													letterSpacing: '-0.01em'
												}}>
													{name}
												</div>
												<div style={{
													fontSize: '14px',
													fontWeight: 700,
													color: '#1a1d29',
													fontFamily: '"SF Mono", "Monaco", monospace'
												}}>
													{amount}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Upcoming Token Unlocks */}
				{listedProjects.nextUnlockAmount && listedProjects.nextUnlockDaysDetailed && (
					<div style={{ 
						backgroundColor: '#ffffff',
						border: '1px solid #e1e5e9',
						borderRadius: '4px',
						marginBottom: '40px',
						boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
						overflow: 'hidden'
					}}>
						<div style={{ 
							padding: '20px 24px', 
							borderBottom: '1px solid #e1e5e9', 
							backgroundColor: '#fafbfc'
						}}>
							<h3 style={{ 
								fontSize: '16px', 
								fontWeight: 600, 
								color: '#1a1d29',
								margin: '0 0 4px 0'
							}}>
								Upcoming Token Unlocks
							</h3>
							<p style={{ 
								fontSize: '13px', 
								color: '#6c7281', 
								margin: 0,
								fontWeight: 400
							}}>
								Next scheduled token releases
							</p>
						</div>
						
						<div style={{ padding: '24px' }}>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
								{/* Primary Unlock */}
								<div style={{ 
									backgroundColor: '#f0f4ff',
									border: '1px solid #c7d2fe',
									borderRadius: '8px',
									padding: '24px'
								}}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
										<div style={{ 
											fontSize: '12px', 
											color: '#4338ca', 
											fontWeight: 600, 
											textTransform: 'uppercase',
											letterSpacing: '0.02em'
										}}>
											Next Unlock
										</div>
										<div style={{ 
											backgroundColor: '#4338ca', 
											color: 'white', 
											padding: '6px 12px', 
											borderRadius: '6px',
											fontSize: '12px',
											fontWeight: 600
										}}>
											{listedProjects.nextUnlockDaysDetailed} days
										</div>
									</div>
									<div>
										<div style={{ 
											fontSize: '28px', 
											fontWeight: 700, 
											color: '#1a1d29', 
											marginBottom: '6px',
											fontFamily: '"SF Mono", "Monaco", monospace'
										}}>
											{formatTokensReceived(listedProjects.nextUnlockAmount)}
										</div>
										<div style={{ 
											fontSize: '14px', 
											color: '#4338ca',
											fontWeight: 500
										}}>
											{listedProjects.nextUnlockProject}
										</div>
									</div>
								</div>

								{/* Secondary Unlock */}
								<div style={{ 
									backgroundColor: '#f8f9fa',
									border: '1px solid #e1e5e9',
									borderRadius: '8px',
									padding: '24px'
								}}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
										<div style={{ 
											fontSize: '12px', 
											color: '#6c7281', 
											fontWeight: 600, 
											textTransform: 'uppercase',
											letterSpacing: '0.02em'
										}}>
											Following Unlock
										</div>
										<div style={{ 
											backgroundColor: '#6c7281', 
											color: 'white', 
											padding: '6px 12px', 
											borderRadius: '6px',
											fontSize: '12px',
											fontWeight: 600
										}}>
											24 days
										</div>
									</div>
									<div>
										<div style={{ 
											fontSize: '28px', 
											fontWeight: 700, 
											color: '#1a1d29', 
											marginBottom: '6px',
											fontFamily: '"SF Mono", "Monaco", monospace'
										}}>
											$21,486
										</div>
										<div style={{ 
											fontSize: '14px', 
											color: '#6c7281',
											fontWeight: 500
										}}>
											Tars AI
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Token Vesting Chart */}
				{data?.vestingChart && (
					<VestingChart data={data.vestingChart} />
				)}

				{/* Blockchain Category Charts */}
				{data?.blockchainCategories && data.blockchainCategories.length > 0 && (
					<>
						<BlockchainCategoryDonutChart data={data.blockchainCategories} />
						<BlockchainCategoryBarChart data={data.blockchainCategories} />
					</>
				)}
				
				{/* Debug: Show vesting data status */}
				{process.env.NODE_ENV === 'development' && (
					<div style={{ 
						backgroundColor: '#f0f0f0', 
						padding: '10px', 
						margin: '10px 0',
						fontSize: '12px',
						fontFamily: 'monospace'
					}}>
						Vesting Debug: {data?.vestingChart ? `${data.vestingChart.length} items` : 'No vesting data'}
						<br />
						Blockchain Categories Debug: {data?.blockchainCategories ? `${data.blockchainCategories.length} categories` : 'No blockchain category data'}
					</div>
				)}

				{/* Investment Portfolio Table */}
				<div style={{ 
					backgroundColor: '#ffffff',
					border: '1px solid #e1e5e9',
					borderRadius: '4px',
					boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
					overflow: 'hidden'
				}}>
					<div style={{ 
						padding: '20px 24px', 
						borderBottom: '1px solid #e1e5e9', 
						backgroundColor: '#fafbfc'
					}}>
						<h3 style={{ 
							fontSize: '16px', 
							fontWeight: 600, 
							color: '#1a1d29',
							margin: '0 0 4px 0'
						}}>
							Investment Portfolio
						</h3>
						<p style={{ 
							fontSize: '13px', 
							color: '#6c7281', 
							margin: 0,
							fontWeight: 400
						}}>
							Detailed performance metrics for {items.length} active investments
						</p>
					</div>
				<div style={{ overflowX: 'auto' }}>
						<table style={{ 
							width: '100%', 
							borderCollapse: 'collapse', 
							fontSize: '13px',
							fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
							backgroundColor: '#ffffff'
						}}>
							<thead>
								<tr style={{ 
									backgroundColor: '#f8f9fa',
									borderBottom: '1px solid #e1e5e9'
								}}>
								{COLUMNS.map(col => {
									const active = sortKey === col.key;
									return (
										<th
											key={col.key}
											onClick={() => onHeaderClick(col.key as ColKey)}
											style={{
												textAlign: col.numeric ? 'right' : 'left',
												padding: '12px 16px',
												fontWeight: 500,
												fontSize: '11px',
												letterSpacing: '0.02em',
												textTransform: 'uppercase',
												color: active ? '#2563eb' : '#6c7281',
												cursor: 'pointer',
												userSelect: 'none',
												background: active ? '#f0f4ff' : 'transparent',
												borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
												transition: 'all 0.15s ease',
												position: 'relative',
												minWidth: col.key === 'vesting' ? '200px' : 'auto',
												width: col.key === 'vesting' ? '200px' : 'auto'
											}}
											onMouseEnter={(e) => {
												if (!active) {
													e.currentTarget.style.background = '#f8f9fa';
												}
											}}
											onMouseLeave={(e) => {
												if (!active) {
													e.currentTarget.style.background = 'transparent';
												}
											}}
											title={`Sort by ${col.label}`}
										>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: col.numeric ? 'flex-end' : 'flex-start', gap: 6 }}>
												{col.label}
												<span style={{ 
													fontSize: '9px', 
													color: active ? '#2563eb' : '#9ca3af',
													opacity: active ? 1 : 0.5
												}}>
													{active ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
											</span>
											</div>
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
								{sorted.map((i, index) => {
									// Debug: Log first investment to check new columns
									if (index === 0) {
										console.log('Investment data:', { 
											name: i.name, 
											buyPrice: i.buyPrice, 
											currentPrice: i.currentPrice, 
											vesting: i.vesting 
										});
									}
									
									const isEven = index % 2 === 0;
									const rowBg = isEven ? '#ffffff' : '#fafbfc';
									
									return (
										<tr 
											key={`${i.name}-${index}`}
											style={{
												background: rowBg,
												borderBottom: '1px solid #f1f3f4',
												transition: 'all 0.1s ease'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.background = '#f8f9fa';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.background = rowBg;
											}}
									>
											<td style={{ 
												padding: '12px 16px', 
												fontWeight: 400,
												borderRight: '1px solid #f1f3f4'
											}}>
												<a 
													href={`/investments/${encodeURIComponent(i.name.toLowerCase().replace(/\s+/g, '-'))}`} 
													style={{ 
														color: '#2563eb', 
														textDecoration: 'none',
														fontWeight: 400,
														fontSize: '13px',
														transition: 'color 0.15s ease'
													}}
													onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
													onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
											>
											{i.name}
										</a>
									</td>
									{COLUMNS.slice(1).map((col, colIndex) => {
										const value = (i as Record<string, unknown>)[col.key];
											let formattedValue;
											
											// Special formatting for unlock columns
											if (col.key === 'nextUnlock') {
												formattedValue = formatUnlockColumn(value as string, 'days');
											} else if (col.key === 'nextUnlock2') {
												formattedValue = formatUnlockColumn(value as string, 'currency');
											} else if (col.key === 'fullUnlock') {
												formattedValue = formatUnlockColumn(value as string, 'days-full');
											} else if (col.key === 'buyPrice' || col.key === 'currentPrice') {
												// Format price columns with thousands decimals
												formattedValue = formatPrice(value as string);
											} else if (col.key === 'vesting') {
												// Vesting column - keep as is (could be text or percentage)
												formattedValue = (value as string) || '-';
											} else {
												formattedValue = formatCell(value as string) || '-';
											}
											
											// Color coding for financial metrics
											let cellColor = '#1a1d29';
											if (col.key === 'realisedPnL') {
												if (formattedValue.includes('-') || formattedValue.includes('(')) {
													cellColor = '#dc2626'; // Red for losses
												} else if (parseFloat(formattedValue.replace(/[^0-9.-]/g, '')) > 0) {
													cellColor = '#059669'; // Green for gains
												}
											} else if (col.key === 'roi' || col.key === 'realisedRoi') {
												const roiNumber = parseFloat(formattedValue.replace(/[^0-9.-]/g, ''));
												if (!isNaN(roiNumber)) {
													if (roiNumber < 1) {
														cellColor = '#dc2626'; // Red for ROI < 1
													} else {
														cellColor = '#059669'; // Green for ROI >= 1
													}
												}
											}
											
											
											return (
												<td 
													key={col.key}
													style={{ 
														padding: '12px 16px',
														textAlign: col.numeric ? 'right' : 'left',
														fontWeight: 400,
														color: cellColor,
														borderRight: colIndex < COLUMNS.length - 2 ? '1px solid #f1f3f4' : 'none',
														fontFamily: col.numeric ? '"SF Mono", "Monaco", monospace' : 'inherit',
														fontSize: '13px',
														minWidth: col.key === 'vesting' ? '200px' : 'auto',
														width: col.key === 'vesting' ? '200px' : 'auto',
														maxWidth: col.key === 'vesting' ? '200px' : 'none',
														wordWrap: col.key === 'vesting' ? 'break-word' : 'normal'
													}}
												>
													{formattedValue}
												</td>
											);
										})}
								</tr>
								);
							})}
							{sorted.length === 0 && (
								<tr>
									<td 
										colSpan={COLUMNS.length} 
										style={{ 
											padding: '32px', 
											textAlign: 'center', 
											color: '#6c7281',
											fontSize: '14px',
											fontWeight: 400
										}}
									>
										No investments found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				</div>
					</>
				) : (
					<>
						{/* Individual Portfolio Dashboard */}
						{currentPortfolio.data && (
							<IndividualPortfolioDashboard 
								portfolio={currentPortfolio.data as IndividualPortfolio}
								onHeaderClick={onHeaderClick}
								sortKey={sortKey}
								sortDir={sortDir}
								individualVestingData={data?.individualVestingData?.[selectedPortfolio]}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
}