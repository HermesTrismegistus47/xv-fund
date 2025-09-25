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
	avgSellPrice: string;
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
	unrealisedRoi: string;  // Renamed from roi
	realisedRoi: string;
	outstandingUSDC: string;  // Outstanding Distributions USDC
	outstandingETH: string;   // Outstanding Distributions ETH
	outstandingSOL: string;   // Outstanding Distributions SOL
	liquidValue: string;
	dpi: string;
	buyPrice: string;
	currentPrice: string;
	avgSellPrice: string;
	percentReceived: string;
	percentSold: string;
	withdrawUSD: string;
	withdrawETH: string;
	withdrawSOL: string;
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
		unrealisedRoi: string;  // Renamed from roi
		realisedRoi: string;
		outstandingUSDC: string;  // Outstanding Distributions USDC
		outstandingETH: string;   // Outstanding Distributions ETH
		outstandingSOL: string;   // Outstanding Distributions SOL
		liquidValue: string;
		dpi: string;
		withdrawUSD: string;
		withdrawETH: string;
		withdrawSOL: string;
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

// Helper function to get top 5 liquid positions
function getTopLiquidPositions(investments: Investment[]): string {
	const liquidPositions = investments
		.map(inv => ({
			name: inv.name,
			liquidValue: parseFloat(inv.liquidValue?.replace(/[$,]/g, '') || '0')
		}))
		.filter(pos => pos.liquidValue > 0)
		.sort((a, b) => b.liquidValue - a.liquidValue)
		.slice(0, 5);
	
	if (liquidPositions.length === 0) return 'No liquid positions';
	return liquidPositions.map(pos => 
		`${pos.name}: ${formatTokensReceived('$' + pos.liquidValue.toLocaleString())}`
	).join(' • ');
}

// Helper function to get top 5 biggest positions by total value
function getTop5BiggestPositions(investments: Investment[], totalPortfolioValue: number) {
	return investments
		.map(inv => ({
			name: inv.name,
			totalValue: parseFloat(inv.totalValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0'),
			buyPrice: inv.buyPrice || '',
			currentPrice: inv.currentPrice || '',
			avgSellPrice: inv.avgSellPrice || ''
		}))
		.filter(pos => pos.totalValue > 0)
		.sort((a, b) => b.totalValue - a.totalValue)
		.slice(0, 5)
		.map(pos => ({
			...pos,
			percentage: totalPortfolioValue > 0 ? (pos.totalValue / totalPortfolioValue) * 100 : 0
		}));
}

// Helper function to get top 5 realised positions by realised value
function getTop5RealisedPositions(investments: Investment[], totalRealisedValue: number) {
	return investments
		.map(inv => ({
			name: inv.name,
			realisedValue: parseFloat(inv.realisedValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0'),
			realisedRoi: inv.realisedRoi || '',
			percentReceived: inv.percentReceived || '',
			percentSold: inv.percentSold || ''
		}))
		.filter(pos => pos.realisedValue > 0)
		.sort((a, b) => b.realisedValue - a.realisedValue)
		.slice(0, 5)
		.map(pos => ({
			...pos,
			percentageOfRealised: totalRealisedValue > 0 ? (pos.realisedValue / totalRealisedValue) * 100 : 0
		}));
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

	// Project colors for the stacked bars - removed Hatom, Tap, Tada, Peaq, CTA (already vested)
	const projectColors: Record<string, string> = {
		'Tars': '#ef4444',
		'Heurist': '#84cc16',
		'Humanity': '#f97316',
		'Giza Seed': '#ec4899',
		'Giza Legion': '#6366f1',
		'Creatorbid': '#14b8a6'
	};

	// Calculate max value for scaling - Apps Script now provides correct monthly deltas
	const maxMonthlyValue = Math.max(...data.map(month => 
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
					Monthly vesting schedule for listed projects (through March 2028)
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
						{data.map((monthData, index) => {
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
	| 'nextUnlock' | 'nextUnlock2' | 'fullUnlock' | 'buyPrice' | 'currentPrice' | 'avgSellPrice' | 'vesting'
	| 'share' | 'unrealisedValue' | 'unrealisedRoi' | 'outstandingUSDC' | 'outstandingETH' | 'outstandingSOL' | 'dpi';

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
	{ key: 'avgSellPrice', label: 'Avg Sell Price', numeric: true },
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

// Helper function to format Outstanding Distributions with currency suffixes
function formatOutstandingDistribution(value: string | undefined | null, currency: 'USDC' | 'ETH' | 'SOL'): string {
	if (!value || value === '' || value === '/') return '/';
	
	// Handle numeric values
	const cleanValue = value.toString().replace(/[,\s]/g, '');
	const number = parseFloat(cleanValue);
	
	if (isNaN(number)) return value.toString();
	
	// Format the number with appropriate decimals
	let formattedNumber: string;
	if (currency === 'USDC') {
		// USDC: 2 decimal places, add commas for thousands
		formattedNumber = number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	} else {
		// ETH/SOL: up to 6 decimal places, remove trailing zeros
		formattedNumber = number.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 });
	}
	
	return `${formattedNumber} ${currency}`;
}

// Individual Portfolio Dashboard Component
// Standardized table template for Top 5 tables
const StandardTop5Table = ({ 
	headers, 
	rows 
}: { 
	headers: string[]; 
	rows: (string | number)[][];
}) => (
	<div style={{ overflowX: 'auto' }}>
		<table style={{ 
			width: '100%', 
			borderCollapse: 'collapse', 
			fontSize: '13px',
			fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
			tableLayout: 'fixed'
		}}>
			<thead>
				<tr style={{ 
					backgroundColor: '#f8f9fa',
					borderBottom: '1px solid #e1e5e9'
				}}>
					{headers.map((header, index) => (
						<th key={header} style={{ 
							textAlign: index === 0 ? 'left' : 'right', 
							padding: '12px 16px', 
							fontWeight: 500, 
							fontSize: '11px', 
							letterSpacing: '0.02em', 
							textTransform: 'uppercase', 
							color: '#6c7281',
							width: index === 0 ? '200px' : index === 5 ? '140px' : index === 4 ? '100px' : '120px'
						}}>
							{header}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, rowIndex) => {
					const isEven = rowIndex % 2 === 0;
					const rowBg = isEven ? '#ffffff' : '#fafbfc';
					
					return (
						<tr 
							key={rowIndex}
							style={{
								background: rowBg,
								borderBottom: rowIndex < rows.length - 1 ? '1px solid #f1f3f4' : 'none'
							}}
						>
							{row.map((cell, cellIndex) => (
								<td key={cellIndex} style={{ 
									padding: '12px 16px', 
									textAlign: cellIndex === 0 ? 'left' : 'right',
									fontWeight: cellIndex === 0 ? 500 : 400,
									borderRight: cellIndex === 0 ? '1px solid #f1f3f4' : 'none'
								}}>
									{cell}
								</td>
							))}
						</tr>
					);
				})}
			</tbody>
		</table>
	</div>
);

function IndividualPortfolioDashboard({ 
	portfolio, 
	onHeaderClick, 
	sortKey, 
	sortDir,
	individualVestingData,
	overviewInvestments,
	data
}: { 
	portfolio: IndividualPortfolio;
	onHeaderClick: (k: ColKey) => void;
	sortKey: string;
	sortDir: 'desc' | 'asc';
	individualVestingData?: VestingData[];
	overviewInvestments?: Investment[];
	data?: any;
}) {
	// Helper function to get price data and percentage data from overview investments
	const getOverviewDataForInvestment = (investmentName: string) => {
		if (!overviewInvestments) return { 
			buyPrice: '', 
			currentPrice: '', 
			avgSellPrice: '', 
			percentReceived: '', 
			percentSold: '' 
		};
		
		const overviewInvestment = overviewInvestments.find(inv => inv.name === investmentName);
		return {
			buyPrice: overviewInvestment?.buyPrice || '',
			currentPrice: overviewInvestment?.currentPrice || '',
			avgSellPrice: overviewInvestment?.avgSellPrice || '',
			percentReceived: overviewInvestment?.percentReceived || '',
			percentSold: overviewInvestment?.percentSold || ''
		};
	};

	// Column definitions for individual portfolio table
	const INDIVIDUAL_COLUMNS: { key: ColKey; label: string; numeric?: boolean }[] = [
		{ key: 'name', label: 'Investment', numeric: false },
		{ key: 'totalInvested', label: 'Total Invested', numeric: true },
		{ key: 'share', label: 'Share %', numeric: true },
		{ key: 'totalValue', label: 'Total Value', numeric: true },
		{ key: 'realisedValue', label: 'Realised Value', numeric: true },  // Moved before P&L
		{ key: 'realisedPnL', label: 'Realised P&L', numeric: true },
		{ key: 'unrealisedValue', label: 'Unrealised Value', numeric: true },
		{ key: 'unrealisedRoi', label: 'Unrealised ROI', numeric: true },  // Renamed from ROI
		{ key: 'realisedRoi', label: 'Realised ROI', numeric: true },
		{ key: 'outstandingUSDC', label: 'Outstanding USDC', numeric: true },  // Outstanding Distributions
		{ key: 'outstandingETH', label: 'Outstanding ETH', numeric: true },
		{ key: 'outstandingSOL', label: 'Outstanding SOL', numeric: true },
		{ key: 'liquidValue', label: 'Liquid Value', numeric: true },
		{ key: 'dpi', label: 'DPI', numeric: true },
		{ key: 'percentReceived', label: '% Received', numeric: true },
		{ key: 'percentSold', label: '% Sold', numeric: true },
	];

	const sorted = useMemo(() => {
		const arr = [...portfolio.investments];
		arr.sort((a, b) => {
			const col = sortKey;
			const colDef = INDIVIDUAL_COLUMNS.find(c => c.key === col);
			if (colDef?.numeric) {
				let av: number, bv: number;
				
				// Handle special cases for % received and % sold which come from overview data
				if (col === 'percentReceived' || col === 'percentSold') {
					const aOverviewData = getOverviewDataForInvestment(a.name);
					const bOverviewData = getOverviewDataForInvestment(b.name);
					const aValue = col === 'percentReceived' ? aOverviewData.percentReceived : aOverviewData.percentSold;
					const bValue = col === 'percentReceived' ? bOverviewData.percentReceived : bOverviewData.percentSold;
					av = parseNumberLike(aValue);
					bv = parseNumberLike(bValue);
				} else {
					av = parseNumberLike((a as Record<string, unknown>)[col] as string);
					bv = parseNumberLike((b as Record<string, unknown>)[col] as string);
				}
				
				return sortDir === 'desc' ? bv - av : av - bv;
			}
			
			// Handle string sorting for non-numeric columns
			let avs: string, bvs: string;
			if (col === 'percentReceived' || col === 'percentSold') {
				const aOverviewData = getOverviewDataForInvestment(a.name);
				const bOverviewData = getOverviewDataForInvestment(b.name);
				avs = col === 'percentReceived' ? aOverviewData.percentReceived : aOverviewData.percentSold;
				bvs = col === 'percentReceived' ? bOverviewData.percentReceived : bOverviewData.percentSold;
			} else {
				avs = String((a as Record<string, unknown>)[col] ?? '');
				bvs = String((b as Record<string, unknown>)[col] ?? '');
			}
			
			return sortDir === 'desc' ? bvs.localeCompare(avs) : avs.localeCompare(bvs);
		});
		return arr;
	}, [portfolio.investments, sortKey, sortDir, overviewInvestments]);

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
					(() => {
						// Calculate Unrealised P&L: totalValue - totalInvested
						const totalInvestedNum = parseFloat(portfolio.summary.totalInvested?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
						const totalValueNum = parseFloat(portfolio.summary.totalValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
						const unrealisedPnL = totalValueNum - totalInvestedNum;
						const unrealisedPnLFormatted = unrealisedPnL >= 0 ? `$${Math.round(Math.abs(unrealisedPnL)).toLocaleString()}` : `-$${Math.round(Math.abs(unrealisedPnL)).toLocaleString()}`;
						
						return (
							<div>
								{/* First Row */}
					<div style={{ 
						display: 'grid', 
									gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
									gap: '16px',
									marginBottom: '16px'
					}}>
						<Stat 
							label="Total Invested" 
								value={formatTokensReceived(portfolio.summary.totalInvested)}
							trend="neutral"
										subtitle="Capital deployed to date"
						/>
						<Stat 
							label="Realised Value" 
								value={formatTokensReceived(portfolio.summary.realisedValue)}
							trend="neutral"
										customColor="#000000"
										subtitle="Cash returned to fund"
						/>
						<Stat 
										label="Total Value" 
								value={formatTokensReceived(portfolio.summary.totalValue)}
							trend="neutral"
										subtitle="Current market valuation"
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
								value={formatTokensReceived(portfolio.summary.realisedPnL)}
							trend={portfolio.summary.realisedPnL && !portfolio.summary.realisedPnL.includes('-') ? "positive" : "negative"}
							subtitle="Profit/Loss on exits"
						/>
						<Stat 
							label="Realised ROI" 
							value={formatROI(portfolio.summary.realisedRoi)} 
										trend={portfolio.summary.realisedRoi && parseFloat(portfolio.summary.realisedRoi.replace('x', '')) < 1 ? "negative" : "positive"}
							subtitle="Return on realised investments"
						/>
									<Stat 
										label="Unrealised P&L" 
										value={unrealisedPnLFormatted}
										trend={unrealisedPnL >= 0 ? "positive" : "negative"}
										subtitle="Unrealised profit/loss"
									/>
									<Stat 
										label="UNREALISED ROI" 
										value={formatROI(portfolio.summary.unrealisedRoi)} 
										trend={portfolio.summary.unrealisedRoi && parseFloat(portfolio.summary.unrealisedRoi.replace('x', '')) >= 1 ? "positive" : "negative"}
										subtitle="Overall return multiple"
						/>
					</div>
							</div>
						);
					})()
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

			{/* Portfolio Composition Section */}
			{portfolio.summary && overviewInvestments && (
				(() => {
					// Calculate total investments (with adjustment for specific portfolios)
					const portfoliosToAdjust = ['zohair', 'iaad', 'mikado', 'bahman', 'matthias'];
					const portfolioKey = portfolio.name.toLowerCase().replace(' portfolio', '');
					const totalInvestments = portfoliosToAdjust.includes(portfolioKey) 
						? portfolio.investments.length - 1 
						: portfolio.investments.length;

					// Calculate Pre-TGE projects (ROI = 1.00 from individual portfolio data, excluding Kebapp)
					const preTgeProjects = portfolio.investments.filter(inv => {
						if (inv.name.toLowerCase().includes('kebapp')) return false;
						// Use ROI from individual portfolio data (column I) - check multiple formats
						const roi = inv.unrealisedRoi;
						console.log(`DEBUG Pre-TGE: ${inv.name} has ROI: "${roi}"`);
						return roi === '1.00x' || roi === '1.00' || roi === '1' || parseFloat(roi.replace('x', '')) === 1.0;
					}).length;
					
					console.log(`DEBUG: Portfolio ${portfolio.name} - Total investments: ${totalInvestments}, Pre-TGE: ${preTgeProjects}, Listed: ${totalInvestments - preTgeProjects}`);

					// Calculate Listed projects
					const listedProjects = totalInvestments - preTgeProjects;

					// Calculate Received from Total Invested
					// Use % received from overview (column I) multiplied by individual invested amounts (column C)
					let receivedFromTotalInvested = 0;
					let totalInvestedAmount = 0;
					
					console.log(`DEBUG Received Calc for ${portfolio.name}:`);
					console.log(`DEBUG: Overview investments available:`, overviewInvestments?.length || 0);
					
					portfolio.investments.forEach(inv => {
						const investedAmount = parseFloat(inv.totalInvested?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
						totalInvestedAmount += investedAmount;
						
						// Find matching investment in overview by name (column B)
						const overviewInv = overviewInvestments.find(ov => ov.name === inv.name);
						if (overviewInv) {
							console.log(`  Found overview match for ${inv.name}: percentReceived="${overviewInv.percentReceived}"`);
							if (overviewInv.percentReceived && overviewInv.percentReceived !== '-' && overviewInv.percentReceived !== '') {
								// Handle different percentage formats
								let percentReceived = 0;
								const percentStr = overviewInv.percentReceived.toString();
								
								if (percentStr.includes('%')) {
									// Format like "45%" -> 0.45
									percentReceived = parseFloat(percentStr.replace('%', '')) / 100;
								} else {
									// Format like "0.45" or "45" (assuming it's already decimal or needs /100)
									const numValue = parseFloat(percentStr);
									if (numValue > 1) {
										// Assume it's like "45" meaning 45%
										percentReceived = numValue / 100;
									} else {
										// Assume it's already decimal like "0.45"
										percentReceived = numValue;
									}
								}
								
								const contributionToReceived = investedAmount * percentReceived;
								receivedFromTotalInvested += contributionToReceived;
								console.log(`    ${inv.name}: invested=$${investedAmount}, %received="${percentStr}" (parsed as ${percentReceived}), contribution=$${contributionToReceived}`);
							} else {
								console.log(`    ${inv.name}: invested=$${investedAmount}, %received is empty or '-'`);
							}
						} else {
							console.log(`  NO MATCH found for ${inv.name} in overview investments`);
						}
					});
					
					console.log(`DEBUG: Total invested: $${totalInvestedAmount}, Total received: $${receivedFromTotalInvested}`);

					// For specific portfolios, exclude Degen Fund from percentage calculation
					const portfoliosToExcludeDegen = ['zohair', 'iaad', 'mikado', 'bahman', 'matthias'];
					const shouldExcludeDegen = portfoliosToExcludeDegen.includes(portfolioKey);
					
					console.log(`DEBUG: Portfolio name: "${portfolio.name}", Portfolio key: "${portfolioKey}", Should exclude Degen: ${shouldExcludeDegen}`);
					
					let adjustedTotalInvested = totalInvestedAmount;
					if (shouldExcludeDegen) {
						// Find Degen Fund investment (should be first row) and subtract its amount
						const degenFundInvestment = portfolio.investments.find(inv => 
							inv.name.toLowerCase().includes('degen fund') || inv.name.toLowerCase().includes('degen')
						);
						if (degenFundInvestment) {
							const degenAmount = parseFloat(degenFundInvestment.totalInvested?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
							adjustedTotalInvested = totalInvestedAmount - degenAmount;
							console.log(`DEBUG: Excluding Degen Fund ($${degenAmount}) from total. Adjusted total: $${adjustedTotalInvested}`);
						}
					}

					const receivedPercentage = adjustedTotalInvested > 0 ? (receivedFromTotalInvested / adjustedTotalInvested) * 100 : 0;

					// Calculate Return on tokens received
					let realisedValue = parseFloat(portfolio.summary.realisedValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
					let liquidValue = parseFloat(portfolio.summary.liquidValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
					
					// For specific portfolios, exclude Degen Fund from realised and liquid values
					if (shouldExcludeDegen) {
						const degenFundInvestment = portfolio.investments.find(inv => 
							inv.name.toLowerCase().includes('degen fund') || inv.name.toLowerCase().includes('degen')
						);
						if (degenFundInvestment) {
							const degenRealisedValue = parseFloat(degenFundInvestment.realisedValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
							const degenLiquidValue = parseFloat(degenFundInvestment.liquidValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
							
							realisedValue = realisedValue - degenRealisedValue;
							liquidValue = liquidValue - degenLiquidValue;
							
							console.log(`DEBUG: Excluding Degen Fund from return calc - Realised: -$${degenRealisedValue}, Liquid: -$${degenLiquidValue}`);
							console.log(`DEBUG: Adjusted values - Realised: $${realisedValue}, Liquid: $${liquidValue}`);
						}
					}
					
					// Use receivedFromTotalInvested as denominator (not total invested)
					const returnOnTokensReceived = receivedFromTotalInvested > 0 ? (realisedValue + liquidValue) / receivedFromTotalInvested : 0;
					
					console.log(`DEBUG Return calc: (realised=$${realisedValue} + liquid=$${liquidValue}) / received=$${receivedFromTotalInvested} = ${returnOnTokensReceived}`);

					return (
						<div style={{ marginBottom: '40px' }}>
							<h2 style={{ 
								fontSize: '18px', 
								fontWeight: 600, 
								color: '#1a1d29',
								margin: '0 0 20px 0',
								letterSpacing: '-0.01em'
							}}>
								Portfolio Composition{shouldExcludeDegen ? '*' : ''}
							</h2>
							{shouldExcludeDegen && (
								<p style={{ 
									fontSize: '12px', 
									color: '#6c7281',
									margin: '0 0 20px 0',
									fontStyle: 'italic'
								}}>
									*Excluding Degen Fund
								</p>
							)}
							
							{/* Stats Grid - Exact same design as overview */}
							<div style={{ 
								display: 'grid', 
								gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
								gap: '16px',
								marginBottom: '24px'
							}}>
								<Stat 
									label="Listed Projects" 
									value={listedProjects} 
									trend="neutral"
									subtitle={`of ${totalInvestments} total investments`}
								/>
								<Stat 
									label="Pre-TGE Projects" 
									value={preTgeProjects} 
									trend="neutral"
									subtitle="Awaiting token generation"
								/>
								<Stat 
									label="Received from Total Invested" 
									value={formatTokensReceived(receivedFromTotalInvested.toString())} 
									trend="neutral"
									customColor="#000000"
									subtitle={`${receivedPercentage.toFixed(1)}% of total invested`}
								/>
								<Stat 
									label="Return on tokens received" 
									value={`${returnOnTokensReceived.toFixed(2)}x`} 
									trend={returnOnTokensReceived > 1 ? "positive" : "negative"}
									subtitle="Including sold and liquid tokens"
								/>
							</div>
						</div>
					);
				})()
			)}

			{/* Liquid Value Section - Exact same design as overview */}
			{portfolio.summary && (
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
							Liquid Value
					</h3>
						<p style={{ 
							fontSize: '13px', 
							color: '#6c7281', 
							margin: 0,
							fontWeight: 400
						}}>
							Immediately tradeable assets
						</p>
					</div>
					
					<div style={{ padding: '24px' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
							{/* Total Liquid Value - Compact */}
						<div style={{ flex: '0 0 auto' }}>
							<div style={{ 
								fontSize: '12px', 
								fontWeight: 500, 
								color: '#6c7281', 
								letterSpacing: '0.02em',
								textTransform: 'uppercase',
									marginBottom: '6px'
							}}>
								Total Liquid Value
							</div>
							<div style={{ 
									fontSize: '32px', 
								fontWeight: 700, 
								color: '#1a1d29',
								lineHeight: 1,
									fontFamily: '"SF Mono", "Monaco", monospace'
							}}>
								{formatTokensReceived(portfolio.summary.liquidValue)}
							</div>
						</div>
						
							{/* Top 5 Liquid Positions - Horizontal List */}
							<div style={{ flex: '1 1 auto', minWidth: '400px', paddingLeft: '40px' }}>
							<div style={{ 
								fontSize: '12px', 
								fontWeight: 500, 
								color: '#6c7281', 
								letterSpacing: '0.02em',
								textTransform: 'uppercase',
								marginBottom: '12px'
							}}>
									Top 5 Liquid Positions
							</div>
							<div style={{ 
									display: 'flex',
									gap: '16px',
									flexWrap: 'wrap'
								}}>
									{(() => {
										const liquidPositions = portfolio.investments
											.map(inv => ({
												name: inv.name,
												liquidValue: parseFloat(inv.liquidValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0')
											}))
											.filter(pos => pos.liquidValue > 0)
											.sort((a, b) => b.liquidValue - a.liquidValue)
											.slice(0, 5);
										
										return liquidPositions.map((position, index) => (
											<div key={position.name} style={{
												padding: '12px 16px',
												backgroundColor: '#f8f9fa',
												border: '1px solid #e1e5e9',
												borderRadius: '6px',
												minWidth: '140px',
												position: 'relative'
											}}>
												{/* Ranking Badge */}
												<div style={{
													position: 'absolute',
													top: '6px',
													right: '6px',
													width: '18px',
													height: '18px',
													backgroundColor: index === 0 ? '#059669' : '#6c7281',
													color: 'white',
													borderRadius: '50%',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontSize: '10px',
													fontWeight: 700
												}}>
													{index + 1}
												</div>
												
												<div style={{
													fontSize: '12px',
													fontWeight: 600,
								color: '#374151',
													marginBottom: '4px',
													letterSpacing: '-0.01em',
													lineHeight: '1.2',
													paddingRight: '20px'
												}}>
													{position.name}
												</div>
												<div style={{
													fontSize: '14px',
													fontWeight: 700,
													color: '#059669',
													fontFamily: '"SF Mono", "Monaco", monospace',
													letterSpacing: '-0.01em'
												}}>
													{formatTokensReceived('$' + position.liquidValue.toLocaleString())}
												</div>
											</div>
										));
									})()}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Top 5 Realised Positions - Exact same design as overview */}
			{portfolio.summary && (
				<div style={{ 
					backgroundColor: '#ffffff',
					border: '1px solid #e1e5e9',
					borderRadius: '8px',
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
							Top 5 Realised Positions
						</h3>
						<p style={{ 
							fontSize: '13px', 
							color: '#6c7281', 
							margin: 0,
							fontWeight: 400
						}}>
							Largest exits by realised value
						</p>
					</div>
					
					<div style={{ padding: '24px' }}>
						{(() => {
							// Calculate total realised value for individual portfolio
							const totalRealisedValue = parseFloat(portfolio.summary.realisedValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
							
							// Create realised positions from individual portfolio investments with overview data
							const realisedPositions = portfolio.investments
								.map(inv => {
									const overviewData = getOverviewDataForInvestment(inv.name);
									return {
										name: inv.name,
										realisedValue: parseFloat(inv.realisedValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0'),
										realisedRoi: inv.realisedRoi || '',
										percentReceived: overviewData.percentReceived || '',
										percentSold: overviewData.percentSold || ''
									};
								})
								.filter(pos => pos.realisedValue > 0)
								.sort((a, b) => b.realisedValue - a.realisedValue)
								.slice(0, 5)
								.map(pos => ({
									...pos,
									percentageOfRealised: totalRealisedValue > 0 ? (pos.realisedValue / totalRealisedValue) * 100 : 0
								}));
							
							const totalTop5RealisedValue = realisedPositions.reduce((sum, pos) => sum + pos.realisedValue, 0);
							const totalTop5RealisedPercentage = totalRealisedValue > 0 ? (totalTop5RealisedValue / totalRealisedValue) * 100 : 0;
							
							return (
								<>
									{/* Summary */}
									<div style={{ 
										display: 'flex', 
										alignItems: 'center', 
										gap: '40px', 
										marginBottom: '32px',
										padding: '20px',
										backgroundColor: '#f8f9fa',
										borderRadius: '6px'
									}}>
										<div>
											<div style={{ 
												fontSize: '12px', 
								fontWeight: 500,
												color: '#6c7281', 
												letterSpacing: '0.02em',
												textTransform: 'uppercase',
												marginBottom: '8px'
							}}>
												Combined Value
							</div>
											<div style={{ 
												fontSize: '28px', 
												fontWeight: 700, 
												color: '#1a1d29',
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{formatTokensReceived('$' + totalTop5RealisedValue.toLocaleString())}
						</div>
										</div>
										<div>
											<div style={{ 
												fontSize: '12px', 
												fontWeight: 500, 
												color: '#6c7281', 
												letterSpacing: '0.02em',
												textTransform: 'uppercase',
												marginBottom: '8px'
											}}>
												% of Total Realised
											</div>
											<div style={{ 
												fontSize: '28px', 
												fontWeight: 700, 
												color: '#059669',
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{totalTop5RealisedPercentage.toFixed(1)}%
											</div>
										</div>
									</div>

									{/* Table */}
									<div style={{ overflowX: 'auto' }}>
										<table style={{ 
											width: '100%', 
											borderCollapse: 'collapse', 
											fontSize: '13px',
											fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
											tableLayout: 'fixed'
										}}>
											<thead>
												<tr style={{ 
													backgroundColor: '#f8f9fa',
													borderBottom: '1px solid #e1e5e9'
												}}>
													<th style={{ 
														textAlign: 'left', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '200px'
													}}>
														Name
													</th>
													<th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#6c7281', width: '140px' }}>Realised Value</th>
													<th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#6c7281', width: '120px' }}>Realised ROI</th>
													<th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#6c7281', width: '120px' }}>% Received</th>
													<th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#6c7281', width: '100px' }}>% Sold</th>
													<th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#6c7281', width: '140px' }}>% of Realised Value</th>
												</tr>
											</thead>
											<tbody>
												{realisedPositions.map((position, index) => {
													const isEven = index % 2 === 0;
													const rowBg = isEven ? '#ffffff' : '#fafbfc';
													
													return (
														<tr 
															key={position.name}
															style={{
																background: rowBg,
																borderBottom: index < realisedPositions.length - 1 ? '1px solid #f1f3f4' : 'none'
															}}
														>
															<td style={{ 
																padding: '12px 16px', 
																fontWeight: 500,
																position: 'sticky',
																left: '0',
																zIndex: 5,
																backgroundColor: rowBg,
																minWidth: '200px',
																maxWidth: '200px',
																whiteSpace: 'nowrap',
																overflow: 'hidden',
																textOverflow: 'ellipsis'
															}}>
																<div style={{ 
																	color: '#1a1d29', 
																	fontWeight: 500,
																	fontSize: '13px'
																}}>
																	{position.name}
																</div>
															</td>
															<td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#1a1d29', fontFamily: '"SF Mono", "Monaco", monospace' }}>
																{formatTokensReceived('$' + position.realisedValue.toLocaleString())}
															</td>
															<td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#1a1d29', fontFamily: '"SF Mono", "Monaco", monospace' }}>
																{formatROI(position.realisedRoi)}
															</td>
															<td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#1a1d29', fontFamily: '"SF Mono", "Monaco", monospace' }}>
																{formatPercentage(position.percentReceived)}
															</td>
															<td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#1a1d29', fontFamily: '"SF Mono", "Monaco", monospace' }}>
																{formatPercentage(position.percentSold)}
															</td>
															<td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#059669', fontFamily: '"SF Mono", "Monaco", monospace' }}>
																{position.percentageOfRealised.toFixed(1)}%
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</>
							);
						})()}
					</div>
				</div>
			)}

			{/* Top 5 Biggest Positions - Exact same design as overview */}
			{portfolio.summary && (
				<div style={{ 
					backgroundColor: '#ffffff',
					border: '1px solid #e1e5e9',
					borderRadius: '8px',
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
							Top 5 Biggest Positions
						</h3>
						<p style={{ 
							fontSize: '13px', 
							color: '#6c7281', 
							margin: 0,
							fontWeight: 400
						}}>
							Largest investments by total value
						</p>
					</div>
					
					<div style={{ padding: '24px' }}>
						{(() => {
							// Calculate total portfolio value for individual portfolio
							const totalPortfolioValue = parseFloat(portfolio.summary.totalValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
							const top5Positions = portfolio.investments
								.map(inv => {
									const overviewData = getOverviewDataForInvestment(inv.name);
									return {
										name: inv.name,
										totalValue: parseFloat(inv.totalValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0'),
										buyPrice: overviewData.buyPrice,
										currentPrice: overviewData.currentPrice,
										avgSellPrice: overviewData.avgSellPrice
									};
								})
								.filter(pos => pos.totalValue > 0)
								.sort((a, b) => b.totalValue - a.totalValue)
								.slice(0, 5)
								.map(pos => ({
									...pos,
									percentage: totalPortfolioValue > 0 ? (pos.totalValue / totalPortfolioValue) * 100 : 0
								}));
							const totalTop5Value = top5Positions.reduce((sum, pos) => sum + pos.totalValue, 0);
							const totalTop5Percentage = totalPortfolioValue > 0 ? (totalTop5Value / totalPortfolioValue) * 100 : 0;
							
							return (
								<>
									{/* Summary */}
									<div style={{ 
										display: 'flex', 
										alignItems: 'center', 
										gap: '40px', 
										marginBottom: '32px',
										padding: '20px',
										backgroundColor: '#f8f9fa',
										borderRadius: '6px'
									}}>
										<div>
											<div style={{ 
												fontSize: '12px', 
												fontWeight: 500, 
												color: '#6c7281', 
												letterSpacing: '0.02em',
												textTransform: 'uppercase',
												marginBottom: '8px'
											}}>
												Combined Value
											</div>
											<div style={{ 
												fontSize: '28px', 
												fontWeight: 700, 
												color: '#1a1d29',
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{formatTokensReceived('$' + totalTop5Value.toLocaleString())}
											</div>
										</div>
										<div>
											<div style={{ 
												fontSize: '12px', 
												fontWeight: 500, 
												color: '#6c7281', 
												letterSpacing: '0.02em',
												textTransform: 'uppercase',
												marginBottom: '8px'
											}}>
												% of Total Portfolio
											</div>
											<div style={{ 
												fontSize: '28px', 
												fontWeight: 700, 
												color: '#059669',
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{totalTop5Percentage.toFixed(1)}%
											</div>
										</div>
									</div>

									{/* Table */}
									<div style={{ 
										border: '1px solid #e1e5e9',
										borderRadius: '6px',
										overflow: 'hidden'
									}}>
										<table style={{ 
											width: '100%', 
											borderCollapse: 'collapse',
											fontSize: '13px',
											fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
											tableLayout: 'fixed'
										}}>
											<thead>
												<tr style={{ 
													backgroundColor: '#f8f9fa',
													borderBottom: '1px solid #e1e5e9'
												}}>
													<th style={{ 
														textAlign: 'left', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '200px'
													}}>
														Name
													</th>
													<th style={{ 
														textAlign: 'right', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '140px'
													}}>
														Total Value
													</th>
													<th style={{ 
														textAlign: 'right', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '120px'
													}}>
														Buy Price
													</th>
													<th style={{ 
														textAlign: 'right', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '120px'
													}}>
														Current Price
													</th>
													<th style={{ 
														textAlign: 'right', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '100px'
													}}>
														Avg Sell Price
													</th>
													<th style={{ 
														textAlign: 'right', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '140px'
													}}>
														% of Portfolio
													</th>
												</tr>
											</thead>
											<tbody>
												{top5Positions.map((position, index) => (
													<tr key={position.name} style={{ 
														backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
														borderBottom: index < top5Positions.length - 1 ? '1px solid #f1f3f4' : 'none'
													}}>
														<td style={{ 
															padding: '12px 16px', 
															fontWeight: 500, 
															color: '#1a1d29' 
														}}>
															{position.name}
														</td>
														<td style={{ 
															padding: '12px 16px', 
															textAlign: 'right', 
															fontWeight: 500, 
															color: '#1a1d29',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{formatTokensReceived('$' + position.totalValue.toLocaleString())}
														</td>
														<td style={{ 
															padding: '12px 16px', 
															textAlign: 'right', 
															fontWeight: 400, 
															color: '#6c7281',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{position.buyPrice ? formatPrice(position.buyPrice) : '-'}
														</td>
														<td style={{ 
															padding: '12px 16px', 
															textAlign: 'right', 
															fontWeight: 400, 
															color: '#6c7281',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{position.currentPrice ? formatPrice(position.currentPrice) : '-'}
														</td>
														<td style={{ 
															padding: '12px 16px', 
															textAlign: 'right', 
															fontWeight: 400, 
															color: '#6c7281',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{position.avgSellPrice ? formatPrice(position.avgSellPrice) : '-'}
														</td>
														<td style={{ 
															padding: '12px 16px', 
															textAlign: 'right', 
															fontWeight: 500, 
															color: '#059669',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{position.percentage.toFixed(1)}%
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</>
							);
						})()}
					</div>
				</div>
			)}


			{/* Distributions to Investors */}
			{portfolio.summary && (
				<div style={{ 
					backgroundColor: '#ffffff',
					border: '1px solid #e1e5e9',
					borderRadius: '8px',
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
							Distributions to Investors
						</h3>
						<p style={{ 
							fontSize: '13px', 
							color: '#6c7281', 
							margin: 0,
							fontWeight: 400
						}}>
							Distribution performance and outstanding amounts
						</p>
					</div>
					
					<div style={{ padding: '24px' }}>
						{(() => {
							// Calculate Total Distributed using sumproduct of column C (totalInvested) and O (dpi)
							let totalDistributed = 0;
							portfolio.investments.forEach(inv => {
								const totalInvested = parseFloat(inv.totalInvested?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
								const dpi = parseFloat(inv.dpi?.replace(/[x\s]/g, '') || '0');
								totalDistributed += totalInvested * dpi;
							});
							
							// Format DPI to 2 decimal places
							const dpiValue = parseFloat(portfolio.summary.dpi?.replace(/[x\s]/g, '') || '0');
							const formattedDPI = `${dpiValue.toFixed(2)}x`;
							
							// Parse outstanding distributions for summary
							const outstandingUSDC = parseFloat(portfolio.summary.outstandingUSDC?.replace(/[^0-9.-]/g, '') || '0');
							const outstandingETH = parseFloat(portfolio.summary.outstandingETH?.replace(/[^0-9.-]/g, '') || '0');
							const outstandingSOL = parseFloat(portfolio.summary.outstandingSOL?.replace(/[^0-9.-]/g, '') || '0');
							
							// Get individual investments that meet thresholds
							const getOutstandingInvestments = (currency: 'USDC' | 'ETH' | 'SOL') => {
								const thresholds = { USDC: 20, ETH: 0.05, SOL: 0.1 };
								
								return portfolio.investments
									.map(inv => {
										let amount = 0;
										if (currency === 'USDC') {
											amount = parseFloat(inv.outstandingUSDC?.replace(/[^0-9.-]/g, '') || '0');
										} else if (currency === 'ETH') {
											amount = parseFloat(inv.outstandingETH?.replace(/[^0-9.-]/g, '') || '0');
										} else if (currency === 'SOL') {
											amount = parseFloat(inv.outstandingSOL?.replace(/[^0-9.-]/g, '') || '0');
										}
										return { name: inv.name, amount };
									})
									.filter(inv => inv.amount > thresholds[currency]) // Only show positive values above threshold
									.sort((a, b) => b.amount - a.amount);
							};
							
							const usdcInvestments = getOutstandingInvestments('USDC');
							const ethInvestments = getOutstandingInvestments('ETH');
							const solInvestments = getOutstandingInvestments('SOL');
							
							return (
								<div>
									{/* Main Metrics */}
									<div style={{ 
										display: 'grid', 
										gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
										gap: '24px',
										marginBottom: '40px'
									}}>
										{/* DPI Score */}
										<div style={{ 
											padding: '24px',
											backgroundColor: '#f8f9fa',
											borderRadius: '8px',
											border: '1px solid #e9ecef',
											textAlign: 'center'
										}}>
											<div style={{ 
												fontSize: '14px', 
												fontWeight: 500, 
												color: '#6c7281',
												marginBottom: '12px',
												textTransform: 'uppercase',
												letterSpacing: '0.02em'
											}}>
												DPI (Distributed to Paid-In)
											</div>
											<div style={{ 
												fontSize: '36px', 
												fontWeight: 700, 
												color: '#1a1d29',
												fontFamily: '"SF Mono", "Monaco", monospace',
												letterSpacing: '-0.02em',
												marginBottom: '8px'
											}}>
												{formattedDPI}
											</div>
											<div style={{ 
												fontSize: '12px', 
												color: '#6c7281'
											}}>
												Cash distributions relative to capital invested
											</div>
										</div>

										{/* Total Distributed */}
										<div style={{ 
											padding: '24px',
											backgroundColor: '#f0f9ff',
											borderRadius: '8px',
											border: '1px solid #0ea5e9',
											textAlign: 'center'
										}}>
											<div style={{ 
												fontSize: '14px', 
												fontWeight: 500, 
												color: '#0369a1',
												marginBottom: '12px',
												textTransform: 'uppercase',
												letterSpacing: '0.02em'
											}}>
												Total Distributed
											</div>
											<div style={{ 
												fontSize: '36px', 
												fontWeight: 700, 
												color: '#0c4a6e',
												fontFamily: '"SF Mono", "Monaco", monospace',
												letterSpacing: '-0.02em',
												marginBottom: '8px'
											}}>
												${Math.round(totalDistributed).toLocaleString()}
											</div>
											<div style={{ 
												fontSize: '12px', 
												color: '#0369a1'
											}}>
												Total cash distributed to investors
											</div>
										</div>
									</div>

									{/* Outstanding Distributions */}
									<div>
										<h4 style={{ 
											fontSize: '16px', 
											fontWeight: 600, 
											color: '#1a1d29',
											margin: '0 0 24px 0',
											textTransform: 'uppercase',
											letterSpacing: '0.02em'
										}}>
											Outstanding Distributions
										</h4>
										
										<div style={{ 
											display: 'grid', 
											gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
											gap: '24px'
										}}>
											{/* USDC Section */}
											<div style={{ 
												backgroundColor: '#ffffff',
												border: '1px solid #e1e5e9',
												borderRadius: '8px',
												overflow: 'hidden'
											}}>
												<div style={{ 
													padding: '16px 20px',
													backgroundColor: '#f8f9fa',
													borderBottom: '1px solid #e1e5e9'
												}}>
													<div style={{ 
														display: 'flex', 
														justifyContent: 'space-between', 
														alignItems: 'center'
													}}>
														<div style={{ 
															fontSize: '14px', 
															fontWeight: 600, 
															color: '#1a1d29',
															textTransform: 'uppercase',
															letterSpacing: '0.02em'
														}}>
															USDC
														</div>
														<div style={{ 
															fontSize: '16px', 
															fontWeight: 600, 
															color: '#059669',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{outstandingUSDC >= 20 ? Math.max(0, outstandingUSDC).toLocaleString() : '0'} USDC
														</div>
													</div>
												</div>
												<div style={{ padding: '16px 20px' }}>
													{usdcInvestments.length > 0 ? (
														<div style={{ fontSize: '13px', color: '#6c7281' }}>
															{usdcInvestments.map((inv, idx) => (
																<div key={inv.name} style={{ 
																	display: 'flex', 
																	justifyContent: 'space-between', 
																	marginBottom: idx < usdcInvestments.length - 1 ? '8px' : '0'
																}}>
																	<span>{inv.name}</span>
																	<span style={{ 
																		fontFamily: '"SF Mono", "Monaco", monospace',
																		color: '#059669'
																	}}>
																		{Math.round(inv.amount).toLocaleString()}
																	</span>
																</div>
															))}
														</div>
													) : (
														<div style={{ 
															fontSize: '13px', 
															color: '#9ca3af', 
															fontStyle: 'italic',
															textAlign: 'center'
														}}>
															No significant outstanding amounts
														</div>
													)}
												</div>
											</div>

											{/* ETH Section */}
											<div style={{ 
												backgroundColor: '#ffffff',
												border: '1px solid #e1e5e9',
												borderRadius: '8px',
												overflow: 'hidden'
											}}>
												<div style={{ 
													padding: '16px 20px',
													backgroundColor: '#f8f9fa',
													borderBottom: '1px solid #e1e5e9'
												}}>
													<div style={{ 
														display: 'flex', 
														justifyContent: 'space-between', 
														alignItems: 'center'
													}}>
														<div style={{ 
															fontSize: '14px', 
															fontWeight: 600, 
															color: '#1a1d29',
															textTransform: 'uppercase',
															letterSpacing: '0.02em'
														}}>
															ETH
														</div>
														<div style={{ 
															fontSize: '16px', 
															fontWeight: 600, 
															color: '#059669',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{Math.abs(outstandingETH).toFixed(4)} ETH
														</div>
													</div>
												</div>
												<div style={{ padding: '16px 20px' }}>
													{ethInvestments.length > 0 ? (
														<div style={{ fontSize: '13px', color: '#6c7281' }}>
															{ethInvestments.map((inv, idx) => (
																<div key={inv.name} style={{ 
																	display: 'flex', 
																	justifyContent: 'space-between', 
																	marginBottom: idx < ethInvestments.length - 1 ? '8px' : '0'
																}}>
																	<span>{inv.name}</span>
																	<span style={{ 
																		fontFamily: '"SF Mono", "Monaco", monospace',
																		color: '#059669'
																	}}>
																		{inv.amount.toFixed(4)}
																	</span>
																</div>
															))}
														</div>
													) : (
														<div style={{ 
															fontSize: '13px', 
															color: '#9ca3af', 
															fontStyle: 'italic',
															textAlign: 'center'
														}}>
															No significant outstanding amounts
														</div>
													)}
												</div>
											</div>

											{/* SOL Section */}
											<div style={{ 
												backgroundColor: '#ffffff',
												border: '1px solid #e1e5e9',
												borderRadius: '8px',
												overflow: 'hidden'
											}}>
												<div style={{ 
													padding: '16px 20px',
													backgroundColor: '#f8f9fa',
													borderBottom: '1px solid #e1e5e9'
												}}>
													<div style={{ 
														display: 'flex', 
														justifyContent: 'space-between', 
														alignItems: 'center'
													}}>
														<div style={{ 
															fontSize: '14px', 
															fontWeight: 600, 
															color: '#1a1d29',
															textTransform: 'uppercase',
															letterSpacing: '0.02em'
														}}>
															SOL
														</div>
														<div style={{ 
															fontSize: '16px', 
															fontWeight: 600, 
															color: '#059669',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{Math.abs(outstandingSOL).toFixed(2)} SOL
														</div>
													</div>
												</div>
												<div style={{ padding: '16px 20px' }}>
													{solInvestments.length > 0 ? (
														<div style={{ fontSize: '13px', color: '#6c7281' }}>
															{solInvestments.map((inv, idx) => (
																<div key={inv.name} style={{ 
																	display: 'flex', 
																	justifyContent: 'space-between', 
																	marginBottom: idx < solInvestments.length - 1 ? '8px' : '0'
																}}>
																	<span>{inv.name}</span>
																	<span style={{ 
																		fontFamily: '"SF Mono", "Monaco", monospace',
																		color: '#059669'
																	}}>
																		{inv.amount.toFixed(2)}
																	</span>
																</div>
															))}
														</div>
													) : (
														<div style={{ 
															fontSize: '13px', 
															color: '#9ca3af', 
															fontStyle: 'italic',
															textAlign: 'center'
														}}>
															No significant outstanding amounts
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})()}
					</div>
				</div>
			)}

			{/* Token Unlock Schedule for Individual Portfolio */}
			{overviewInvestments && data?.vestingChart && data.vestingChart.length > 0 && (
				(() => {
					// Calculate proportional vesting data based on share percentages
					const proportionalVestingData = data.vestingChart.map((monthData: any) => {
						const proportionalMonth = { month: monthData.month };
						
						// For each project, calculate the proportional amount based on portfolio share (excluding already vested projects)
						['Tars', 'Heurist', 'Humanity', 'Giza Seed', 'Giza Legion', 'Creatorbid'].forEach(projectName => {
							const totalAmount = monthData[projectName as keyof typeof monthData] as number || 0;
							
							// Handle name mapping for projects where sheet names differ from chart names
							let sheetProjectName = projectName;
							if (projectName === 'Creatorbid') {
								sheetProjectName = 'Creator Bid';
							} else if (projectName === 'Tars') {
								sheetProjectName = 'Tars AI';
							}
							
							// Find the investment in this individual portfolio to get the share percentage
							const portfolioInvestment = portfolio.investments.find(inv => inv.name === sheetProjectName);
							if (portfolioInvestment && portfolioInvestment.share) {
								// Parse share percentage (e.g., "60%" -> 0.6)
								const sharePercent = parseFloat(portfolioInvestment.share.replace('%', '')) / 100;
								const proportionalAmount = totalAmount * sharePercent * 100;
								proportionalMonth[projectName as keyof typeof proportionalMonth] = proportionalAmount;
								
								// Debug logging for all projects to see the issue
								console.log(`DEBUG: ${portfolio.name} - ${projectName}: total=${totalAmount}, share=${portfolioInvestment.share} (${sharePercent}), result=${proportionalAmount}`);
							} else {
								proportionalMonth[projectName as keyof typeof proportionalMonth] = 0;
								
								// Debug logging for missing investments
								if (projectName === 'Giza Legion') {
									console.log(`DEBUG: ${portfolio.name} - ${projectName}: NOT FOUND in portfolio investments`);
								}
							}
						});
						
						return proportionalMonth;
					});
					
					// Only show the chart if there's meaningful data (excluding already vested projects)
					const hasData = proportionalVestingData.some((month: any) => 
						['Tars', 'Heurist', 'Humanity', 'Giza Seed', 'Giza Legion', 'Creatorbid'].some(project => 
							(month[project as keyof typeof month] as number || 0) > 0
						)
					);
					
					return hasData ? <VestingChart data={proportionalVestingData} /> : null;
				})()
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
						Detailed performance metrics for {(() => {
						// Subtract 1 for specific portfolios: Zohair, Iaad, Bahman, Matthias
						const portfoliosToAdjust = ['zohair', 'iaad', 'mikado', 'bahman', 'matthias'];
						const portfolioKey = portfolio.name.toLowerCase().replace(' portfolio', '');
						const baseCount = portfolio.investments.length;
						return portfoliosToAdjust.includes(portfolioKey) ? baseCount - 1 : baseCount;
					})()} investments
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
								{INDIVIDUAL_COLUMNS.map((col, colIndex) => {
									const active = sortKey === col.key;
									const isFirstColumn = colIndex === 0;
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
												background: active ? '#f0f4ff' : (isFirstColumn ? '#f8f9fa' : 'transparent'),
												borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
												transition: 'all 0.15s ease',
												position: isFirstColumn ? 'sticky' : 'relative',
												left: isFirstColumn ? '0' : 'auto',
												zIndex: isFirstColumn ? 20 : 1,
												minWidth: isFirstColumn ? '200px' : 'auto',
												maxWidth: isFirstColumn ? '200px' : 'auto'
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
											// Update sticky column background on hover
											const stickyCell = e.currentTarget.querySelector('td:first-child') as HTMLElement;
											if (stickyCell) {
												stickyCell.style.backgroundColor = '#f8f9fa';
											}
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = rowBg;
											// Reset sticky column background
											const stickyCell = e.currentTarget.querySelector('td:first-child') as HTMLElement;
											if (stickyCell) {
												stickyCell.style.backgroundColor = rowBg;
											}
										}}
									>
										<td style={{ 
											padding: '12px 16px', 
											fontWeight: 500,
											borderRight: '1px solid #f1f3f4',
											position: 'sticky',
											left: '0',
											zIndex: 15,
											backgroundColor: rowBg,
											minWidth: '200px',
											maxWidth: '200px'
										}}>
											<div style={{ 
												color: '#1a1d29', 
												fontWeight: 500,
												fontSize: '13px',
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis'
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
											} else if (col.key === 'unrealisedRoi' || col.key === 'realisedRoi') {
												formattedValue = formatROI(value as string);
											} else if (col.key === 'outstandingUSDC') {
												formattedValue = formatOutstandingDistribution(value as string, 'USDC');
											} else if (col.key === 'outstandingETH') {
												formattedValue = formatOutstandingDistribution(value as string, 'ETH');
											} else if (col.key === 'outstandingSOL') {
												formattedValue = formatOutstandingDistribution(value as string, 'SOL');
											} else if (col.key === 'percentReceived' || col.key === 'percentSold') {
												// Get the data from overview investments since individual portfolios don't have this data
												const overviewData = getOverviewDataForInvestment(investment.name);
												const percentValue = col.key === 'percentReceived' ? overviewData.percentReceived : overviewData.percentSold;
												formattedValue = formatPercentage(percentValue);
											}
											
											// Color coding for financial metrics
											let cellColor = '#1a1d29';
											if (col.key === 'realisedPnL') {
												if (formattedValue.includes('-') || formattedValue.includes('(')) {
													cellColor = '#dc2626'; // Red for losses
												} else if (parseFloat(formattedValue.replace(/[^0-9.-]/g, '')) > 0) {
													cellColor = '#059669'; // Green for gains
												}
											} else if (col.key === 'unrealisedRoi' || col.key === 'realisedRoi') {
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
	const { data, isLoading, error, mutate } = useSWR<Portfolio>('/api/portfolio', fetcher, { refreshInterval: 60_000 });

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
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

	// Refresh function to call the refresh API
	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			const response = await fetch('/api/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			
			const result = await response.json();
			
			if (result.success) {
				// Trigger SWR to refetch the data
				mutate();
				// Update the last refresh timestamp
				setLastRefreshTime(new Date());
				// Show success message (you could add a toast notification here)
				console.log('Prices refreshed successfully');
			} else {
				console.error('Refresh failed:', result.error);
				// You could show an error message to the user here
			}
		} catch (error) {
			console.error('Refresh error:', error);
		} finally {
			setIsRefreshing(false);
		}
	};

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
		{ value: 'karl', label: 'Karl Portfolio' },
		{ value: 'analytics', label: 'Analytics*' }
	];

	if (isLoading) return <div style={{ padding: 24 }}>Loading…</div>;
	if (error) return <div style={{ padding: 24, color: 'crimson' }}>Failed to load.</div>;

	return (
		<>
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
								Portfolio Tracker • {listedProjects?.totalInvestments || 0} Total Investments
							</p>
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
							{/* Refresh Button */}
							<button
								onClick={handleRefresh}
								disabled={isRefreshing}
								style={{
									padding: '8px 16px',
									fontSize: '14px',
									fontWeight: 500,
									color: isRefreshing ? '#6c7281' : '#ffffff',
									backgroundColor: isRefreshing ? '#e1e5e9' : '#059669',
									border: 'none',
									borderRadius: '6px',
									cursor: isRefreshing ? 'not-allowed' : 'pointer',
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									transition: 'all 0.2s ease',
									minWidth: '100px',
									justifyContent: 'center'
								}}
								onMouseEnter={(e) => {
									if (!isRefreshing) {
										e.currentTarget.style.backgroundColor = '#047857';
									}
								}}
								onMouseLeave={(e) => {
									if (!isRefreshing) {
										e.currentTarget.style.backgroundColor = '#059669';
									}
								}}
							>
								{isRefreshing ? (
									<>
										<div style={{
											width: '14px',
											height: '14px',
											border: '2px solid #6c7281',
											borderTop: '2px solid transparent',
											borderRadius: '50%',
											animation: 'spin 1s linear infinite'
										}} />
										Refreshing...
									</>
								) : (
									<>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
											<path d="M21 3v5h-5" />
											<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
											<path d="M3 21v-5h5" />
										</svg>
										Refresh
									</>
								)}
							</button>

							{/* Portfolio Selector */}
							<select 
								value={selectedPortfolio}
								onChange={(e) => {
									if (e.target.value === 'analytics') {
										window.location.href = '/analytics';
									} else {
										setSelectedPortfolio(e.target.value);
									}
								}}
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
									{lastRefreshTime ? 
										lastRefreshTime.toLocaleDateString('en-US', { 
										month: 'short', 
										day: 'numeric', 
										year: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
										}) : 'Never refreshed'
									}
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
										Liquid Value
							</h3>
							<p style={{ 
								fontSize: '13px', 
								color: '#6c7281', 
								margin: 0,
								fontWeight: 400
							}}>
								Immediately tradeable assets
							</p>
									</div>
						
					<div style={{ padding: '24px' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
							{/* Total Liquid Value - Compact */}
							<div style={{ flex: '0 0 auto' }}>
								<div style={{ 
									fontSize: '12px', 
									fontWeight: 500, 
									color: '#6c7281', 
									letterSpacing: '0.02em',
									textTransform: 'uppercase',
									marginBottom: '6px'
								}}>
									Total Liquid Value
								</div>
								<div style={{ 
									fontSize: '32px', 
									fontWeight: 700, 
									color: '#1a1d29',
									lineHeight: 1,
									fontFamily: '"SF Mono", "Monaco", monospace'
								}}>
									{formatTokensReceived(o.liquidValue)}
								</div>
							</div>
							
							{/* Top 5 Liquid Positions - Horizontal List */}
							<div style={{ flex: '1 1 auto', minWidth: '400px', paddingLeft: '40px' }}>
							<div style={{ 
									fontSize: '12px', 
									fontWeight: 500, 
									color: '#6c7281',
									letterSpacing: '0.02em',
									textTransform: 'uppercase',
									marginBottom: '12px'
								}}>
									Top 5 Liquid Positions
								</div>
								<div style={{ 
									display: 'flex',
									gap: '16px',
									flexWrap: 'wrap'
								}}>
									{(() => {
										const liquidPositions = items
											.map(inv => ({
												name: inv.name,
												liquidValue: parseFloat(inv.liquidValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0')
											}))
											.filter(pos => pos.liquidValue > 0)
											.sort((a, b) => b.liquidValue - a.liquidValue)
											.slice(0, 5);
										
										return liquidPositions.map((position, index) => (
											<div key={position.name} style={{
												padding: '12px 16px',
												backgroundColor: '#f8f9fa',
												border: '1px solid #e1e5e9',
												borderRadius: '6px',
												minWidth: '140px',
												position: 'relative'
											}}>
												{/* Ranking Badge */}
												<div style={{
													position: 'absolute',
													top: '6px',
													right: '6px',
													width: '18px',
													height: '18px',
													backgroundColor: index === 0 ? '#059669' : '#6c7281',
													color: 'white',
													borderRadius: '50%',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontSize: '10px',
													fontWeight: 700
												}}>
													{index + 1}
												</div>
												
												<div style={{
													fontSize: '12px',
													fontWeight: 600,
													color: '#374151',
													marginBottom: '4px',
													letterSpacing: '-0.01em',
													lineHeight: '1.2',
													paddingRight: '20px'
												}}>
													{position.name}
												</div>
												<div style={{
													fontSize: '14px',
													fontWeight: 700,
													color: '#059669',
													fontFamily: '"SF Mono", "Monaco", monospace',
													letterSpacing: '-0.01em'
												}}>
													{formatTokensReceived('$' + position.liquidValue.toLocaleString())}
												</div>
											</div>
										));
									})()}
								</div>
							</div>
						</div>
					</div>
					</div>
				)}

				{/* Top 5 Realised Positions */}
				<div style={{ 
					backgroundColor: '#ffffff',
					border: '1px solid #e1e5e9',
					borderRadius: '8px',
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
							Top 5 Realised Positions
						</h3>
						<p style={{ 
							fontSize: '13px', 
							color: '#6c7281', 
							margin: 0,
							fontWeight: 400
						}}>
							Largest exits by realised value
						</p>
					</div>
					
					<div style={{ padding: '24px' }}>
						{(() => {
							// Parse the total realised value correctly from the formatted string
							const totalRealisedValue = parseFloat(o.realisedValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
							const top5RealisedPositions = getTop5RealisedPositions(items, totalRealisedValue);
							const totalTop5RealisedValue = top5RealisedPositions.reduce((sum, pos) => sum + pos.realisedValue, 0);
							const totalTop5RealisedPercentage = totalRealisedValue > 0 ? (totalTop5RealisedValue / totalRealisedValue) * 100 : 0;
							
							return (
								<>
									{/* Summary */}
									<div style={{ 
										display: 'flex', 
										alignItems: 'center', 
										gap: '40px', 
										marginBottom: '32px',
										padding: '20px',
										backgroundColor: '#f8f9fa',
										borderRadius: '6px'
									}}>
										<div>
											<div style={{ 
												fontSize: '12px', 
												fontWeight: 500, 
												color: '#6c7281', 
												letterSpacing: '0.02em',
												textTransform: 'uppercase',
												marginBottom: '8px'
											}}>
												Combined Value
											</div>
											<div style={{ 
												fontSize: '28px', 
													fontWeight: 700,
													color: '#1a1d29',
													fontFamily: '"SF Mono", "Monaco", monospace'
												}}>
												{formatTokensReceived('$' + totalTop5RealisedValue.toLocaleString())}
												</div>
											</div>
										<div>
											<div style={{ 
												fontSize: '12px', 
												fontWeight: 500, 
												color: '#6c7281', 
												letterSpacing: '0.02em',
												textTransform: 'uppercase',
												marginBottom: '8px'
											}}>
												% of Total Realised
											</div>
											<div style={{ 
												fontSize: '28px', 
												fontWeight: 700, 
												color: '#059669',
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{totalTop5RealisedPercentage.toFixed(1)}%
											</div>
										</div>
									</div>

									{/* Table */}
									<div style={{ overflowX: 'auto' }}>
										<table style={{ 
											width: '100%', 
											borderCollapse: 'collapse', 
											fontSize: '13px',
											fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
											tableLayout: 'fixed'
										}}>
											<thead>
												<tr style={{ 
													backgroundColor: '#f8f9fa',
													borderBottom: '1px solid #e1e5e9'
												}}>
													<th style={{ 
														textAlign: 'left', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														position: 'sticky',
														left: '0',
														zIndex: 10,
														backgroundColor: '#f8f9fa',
														width: '200px'
													}}>
														Name
													</th>
													<th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#6c7281', width: '140px' }}>Realised Value</th>
													<th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#6c7281', width: '120px' }}>Realised ROI</th>
													<th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#6c7281', width: '120px' }}>% Received</th>
													<th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#6c7281', width: '100px' }}>% Sold</th>
													<th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#6c7281', width: '140px' }}>% of Realised Value</th>
												</tr>
											</thead>
											<tbody>
												{top5RealisedPositions.map((position, index) => {
													const isEven = index % 2 === 0;
													const rowBg = isEven ? '#ffffff' : '#fafbfc';
													
													return (
														<tr 
															key={position.name}
															style={{
																background: rowBg,
																borderBottom: index < top5RealisedPositions.length - 1 ? '1px solid #f1f3f4' : 'none'
															}}
														>
															<td style={{ 
																padding: '12px 16px', 
																fontWeight: 500,
																position: 'sticky',
																left: '0',
																zIndex: 5,
																backgroundColor: rowBg,
																minWidth: '200px',
																maxWidth: '200px',
																whiteSpace: 'nowrap',
																overflow: 'hidden',
																textOverflow: 'ellipsis'
															}}>
																<div style={{ 
																	color: '#1a1d29', 
																	fontWeight: 500,
																	fontSize: '13px'
																}}>
																	{position.name}
																</div>
															</td>
															<td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#1a1d29', fontFamily: '"SF Mono", "Monaco", monospace' }}>
																{formatTokensReceived('$' + position.realisedValue.toLocaleString())}
															</td>
															<td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#1a1d29', fontFamily: '"SF Mono", "Monaco", monospace' }}>
																{formatROI(position.realisedRoi)}
															</td>
															<td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#1a1d29', fontFamily: '"SF Mono", "Monaco", monospace' }}>
																{formatPercentage(position.percentReceived)}
															</td>
															<td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#1a1d29', fontFamily: '"SF Mono", "Monaco", monospace' }}>
																{formatPercentage(position.percentSold)}
															</td>
															<td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#059669', fontFamily: '"SF Mono", "Monaco", monospace' }}>
																{position.percentageOfRealised.toFixed(1)}%
															</td>
														</tr>
										);
									})}
											</tbody>
										</table>
								</div>
								</>
							);
						})()}
							</div>
						</div>

				{/* Top 5 Biggest Positions */}
				<div style={{ 
					backgroundColor: '#ffffff',
					border: '1px solid #e1e5e9',
					borderRadius: '8px',
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
							Top 5 Biggest Positions
						</h3>
						<p style={{ 
							fontSize: '13px', 
							color: '#6c7281', 
							margin: 0,
							fontWeight: 400
						}}>
							Largest investments by total value
						</p>
					</div>
					
					<div style={{ padding: '24px' }}>
						{(() => {
							// Parse the total portfolio value correctly from the formatted string
							// Handle Unicode characters like â¯ that appear in place of commas
							const totalPortfolioValue = parseFloat(o.totalValue?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
							const top5Positions = getTop5BiggestPositions(items, totalPortfolioValue);
							const totalTop5Value = top5Positions.reduce((sum, pos) => sum + pos.totalValue, 0);
							const totalTop5Percentage = totalPortfolioValue > 0 ? (totalTop5Value / totalPortfolioValue) * 100 : 0;
							
							return (
								<>
									{/* Summary */}
									<div style={{ 
										display: 'flex', 
										alignItems: 'center', 
										gap: '40px', 
										marginBottom: '32px',
										padding: '20px',
										backgroundColor: '#f8f9fa',
										borderRadius: '6px'
									}}>
										<div>
											<div style={{ 
												fontSize: '12px', 
												fontWeight: 500, 
												color: '#6c7281', 
												letterSpacing: '0.02em',
												textTransform: 'uppercase',
												marginBottom: '8px'
											}}>
												Combined Value
											</div>
											<div style={{ 
												fontSize: '28px', 
												fontWeight: 700, 
												color: '#1a1d29',
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{formatTokensReceived('$' + totalTop5Value.toLocaleString())}
											</div>
										</div>
										<div>
											<div style={{ 
												fontSize: '12px', 
												fontWeight: 500, 
												color: '#6c7281', 
												letterSpacing: '0.02em',
												textTransform: 'uppercase',
												marginBottom: '8px'
											}}>
												% of Total Fund
											</div>
											<div style={{ 
												fontSize: '28px', 
												fontWeight: 700, 
												color: '#059669',
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{totalTop5Percentage.toFixed(1)}%
											</div>
										</div>
									</div>

									{/* Table */}
									<div style={{ 
										border: '1px solid #e1e5e9',
										borderRadius: '6px',
										overflow: 'hidden'
									}}>
										<table style={{ 
											width: '100%', 
											borderCollapse: 'collapse',
											fontSize: '13px',
											fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
											tableLayout: 'fixed'
										}}>
											<thead>
												<tr style={{ 
													backgroundColor: '#f8f9fa',
													borderBottom: '1px solid #e1e5e9'
												}}>
													<th style={{ 
														textAlign: 'left', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '200px'
													}}>
														Name
													</th>
													<th style={{ 
														textAlign: 'right', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '140px'
													}}>
														Total Value
													</th>
													<th style={{ 
														textAlign: 'right', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '120px'
													}}>
														Buy Price
													</th>
													<th style={{ 
														textAlign: 'right', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '120px'
													}}>
														Current Price
													</th>
													<th style={{ 
														textAlign: 'right', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '100px'
													}}>
														Avg Sell Price
													</th>
													<th style={{ 
														textAlign: 'right', 
														padding: '12px 16px', 
														fontWeight: 500, 
														fontSize: '11px', 
														letterSpacing: '0.02em', 
														textTransform: 'uppercase', 
														color: '#6c7281',
														width: '140px'
													}}>
														% of Portfolio
													</th>
												</tr>
											</thead>
											<tbody>
												{top5Positions.map((position, index) => (
													<tr key={position.name} style={{ 
														backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
														borderBottom: index < top5Positions.length - 1 ? '1px solid #f1f3f4' : 'none'
													}}>
														<td style={{ 
															padding: '12px 16px', 
															fontWeight: 500, 
															color: '#1a1d29' 
														}}>
															{position.name}
														</td>
														<td style={{ 
															padding: '12px 16px', 
															textAlign: 'right', 
															fontWeight: 500, 
															color: '#1a1d29',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{formatTokensReceived('$' + position.totalValue.toLocaleString())}
														</td>
														<td style={{ 
															padding: '12px 16px', 
															textAlign: 'right', 
															fontWeight: 400, 
															color: '#6c7281',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{position.buyPrice ? formatPrice(position.buyPrice) : '-'}
														</td>
														<td style={{ 
															padding: '12px 16px', 
															textAlign: 'right', 
															fontWeight: 400, 
															color: '#6c7281',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{position.currentPrice ? formatPrice(position.currentPrice) : '-'}
														</td>
														<td style={{ 
															padding: '12px 16px', 
															textAlign: 'right', 
															fontWeight: 400, 
															color: '#6c7281',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{position.avgSellPrice ? formatPrice(position.avgSellPrice) : '-'}
														</td>
														<td style={{ 
															padding: '12px 16px', 
															textAlign: 'right', 
															fontWeight: 500, 
															color: '#059669',
															fontFamily: '"SF Mono", "Monaco", monospace'
														}}>
															{position.percentage.toFixed(1)}%
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</>
							);
						})()}
					</div>
				</div>

				{/* Upcoming Token Unlocks */}
				{listedProjects.nextUnlockAmount && listedProjects.nextUnlockDaysDetailed && (() => {
					// Parse the unlock amount and only show if above $1000
					const unlockValue = parseFloat(listedProjects.nextUnlockAmount?.replace(/[$,\s\u202F\u00A0â¯]/g, '') || '0');
					return unlockValue > 1000;
				})() && (
					<div style={{ 
						backgroundColor: '#ffffff',
						border: '1px solid #e1e5e9',
						borderRadius: '8px',
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
							Detailed performance metrics for {listedProjects?.totalInvestments || 0} investments
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
								{COLUMNS.map((col, index) => {
									const active = sortKey === col.key;
									const isFirstColumn = index === 0;
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
												position: isFirstColumn ? 'sticky' : 'relative',
												left: isFirstColumn ? '0' : 'auto',
												zIndex: isFirstColumn ? 30 : 1,
												minWidth: col.key === 'vesting' ? '200px' : isFirstColumn ? '200px' : 'auto',
												width: col.key === 'vesting' ? '200px' : isFirstColumn ? '200px' : 'auto'
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
											avgSellPrice: i.avgSellPrice,
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
												// Update sticky column background on hover
												const firstCell = e.currentTarget.querySelector('td:first-child') as HTMLElement;
												if (firstCell) firstCell.style.backgroundColor = '#f8f9fa';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.background = rowBg;
												// Restore sticky column background
												const firstCell = e.currentTarget.querySelector('td:first-child') as HTMLElement;
												if (firstCell) firstCell.style.backgroundColor = rowBg;
											}}
									>
											<td style={{ 
												padding: '12px 16px', 
												fontWeight: 400,
												borderRight: '1px solid #f1f3f4',
												position: 'sticky',
												left: '0',
												zIndex: 25,
												backgroundColor: rowBg,
												minWidth: '200px',
												maxWidth: '200px',
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis'
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
								overviewInvestments={items}
								data={data}
							/>
						)}
					</>
				)}
			</div>
		</div>
			
			<style jsx>{`
				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
			`}</style>
		</>
	);
}