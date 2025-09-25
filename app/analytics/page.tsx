'use client';

import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Types (same as main page)
type Investment = {
	name: string;
	totalInvested: string;
	share: string;
	totalValue: string;
	realisedValue: string;
	unrealisedValue: string;
	realisedPnL: string;
	roi: string;
	liquidValue: string;
	buyPrice: string;
	currentPrice: string;
	avgSellPrice: string;
	nextUnlock: string;
	nextUnlock2: string;
	vesting: string;
};

type BlockchainCategory = {
	category: string;
	totalInvested: string;
	totalValue: string;
	realisedValue: string;
	unrealisedValue: string;
	realisedPnL: string;
	roi: string;
	realisedRoi: string;
	unrealisedRoi: string;
	investmentsCount: number;
};

type PortfolioData = {
	overview: {
		totalInvested: string;
		totalValue: string;
		realisedValue: string;
		realisedPnL: string;
		unrealisedValue: string;
		liquidValue: string;
		roi: string;
		realisedRoi: string;
		unrealisedPnL: string;
		percentReceived: string;
		percentSold: string;
		investmentsCount: number;
		listedCount: number;
		nonListedCount: number;
		tokensReceived: string;
		tokensReceivedPercentage: string;
	};
	investments: Investment[];
	blockchainCategories: BlockchainCategory[];
};

// Helper functions
function formatTokensReceived(value: string | undefined | null): string {
	if (!value || value === '' || value === '0' || value === '$0') return '';
	
	// Handle percentage values
	if (value.includes('%')) {
		return value;
	}
	
	// Handle 'x' multiplier values (like ROI)
	if (value.includes('x')) {
		return value;
	}
	
	// Handle currency values
	if (value.includes('$')) {
		// Remove any existing $ and clean up
		const cleanValue = value.replace(/^\$/, '').replace(/[,\s]/g, '');
		const number = parseFloat(cleanValue);
		
		if (isNaN(number)) return value;
		
		// Format with commas and $ sign
		return '$' + Math.round(number).toLocaleString();
	}
	
	return value;
}

function getROIColor(roi: string): string {
	if (!roi || roi === '' || roi === '0x') return '#6c7281';
	
	const numericValue = parseFloat(roi.replace('x', ''));
	if (isNaN(numericValue)) return '#6c7281';
	
	if (numericValue > 1) return '#059669'; // Green for positive
	if (numericValue < 1) return '#dc2626'; // Red for negative
	return '#6c7281'; // Gray for neutral
}

export default function Analytics() {
	const { data, error, isLoading, mutate } = useSWR<PortfolioData>('/api/portfolio', fetcher, {
		refreshInterval: 30000,
		revalidateOnFocus: false,
	});

	const [isRefreshing, setIsRefreshing] = useState(false);

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

	if (error) {
		return (
			<div style={{ 
				padding: '40px', 
				textAlign: 'center',
				backgroundColor: '#fef2f2',
				border: '1px solid #fecaca',
				borderRadius: '8px',
				margin: '20px'
			}}>
				<h2 style={{ color: '#dc2626', marginBottom: '10px' }}>Error Loading Data</h2>
				<p style={{ color: '#7f1d1d' }}>Failed to fetch portfolio data. Please try again later.</p>
			</div>
		);
	}

	if (isLoading || !data) {
		return (
			<div style={{ 
				padding: '40px', 
				textAlign: 'center',
				color: '#6c7281'
			}}>
				<div style={{ 
					fontSize: '18px', 
					marginBottom: '10px' 
				}}>
					Loading Analytics...
				</div>
				<div style={{ 
					width: '40px', 
					height: '40px', 
					border: '3px solid #e1e5e9', 
					borderTop: '3px solid #3b82f6', 
					borderRadius: '50%', 
					animation: 'spin 1s linear infinite',
					margin: '0 auto'
				}} />
			</div>
		);
	}

	const { blockchainCategories } = data;

	return (
		<div style={{ 
			minHeight: '100vh', 
			backgroundColor: '#f8f9fa',
			fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
		}}>
			{/* Navigation Header */}
			<div style={{ 
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e1e5e9',
				padding: '20px 0'
			}}>
				<div style={{ 
					maxWidth: '1400px', 
					margin: '0 auto', 
					padding: '0 20px',
					display: 'flex', 
					justifyContent: 'space-between', 
					alignItems: 'center'
				}}>
					<div>
						<h1 style={{ 
							fontSize: '24px', 
							fontWeight: 700, 
							color: '#1a1d29',
							margin: '0 0 4px 0',
							letterSpacing: '-0.02em'
						}}>
							Analytics
						</h1>
						<p style={{ 
							fontSize: '14px', 
							color: '#6c7281', 
							margin: 0,
							fontWeight: 400
						}}>
							Detailed performance analysis by blockchain categories
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
							value="analytics"
							onChange={(e) => {
								if (e.target.value === 'analytics') {
									// Stay on current page
								} else {
									window.location.href = '/';
								}
							}}
							style={{
								padding: '8px 12px',
								fontSize: '14px',
								fontWeight: 500,
								color: '#1a1d29',
								backgroundColor: '#ffffff',
								border: '1px solid #d1d5db',
								borderRadius: '6px',
								outline: 'none',
								cursor: 'pointer',
								minWidth: '180px'
							}}
						>
							{portfolioOptions.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			<div style={{ 
				maxWidth: '1400px', 
				margin: '0 auto', 
				padding: '40px 20px'
			}}>

				{/* Category Breakdown */}
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
							Category Breakdown
						</h3>
						<p style={{ 
							fontSize: '13px', 
							color: '#6c7281', 
							margin: 0,
							fontWeight: 400
						}}>
							Investment distribution across blockchain categories
						</p>
					</div>
					
					<div style={{ padding: '24px' }}>
						<div style={{ 
							display: 'grid', 
							gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
							gap: '20px'
						}}>
							{blockchainCategories.map((category) => (
								<div key={category.category} style={{
									padding: '20px',
									backgroundColor: '#f8f9fa',
									border: '1px solid #e1e5e9',
									borderRadius: '8px'
								}}>
									<div style={{
										fontSize: '14px',
										fontWeight: 600,
										color: '#1a1d29',
										marginBottom: '12px'
									}}>
										{category.category}
									</div>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
										<div>
											<span style={{ color: '#6c7281' }}>Invested:</span>
											<div style={{ fontWeight: 600, color: '#1a1d29', fontFamily: '"SF Mono", monospace' }}>
												{formatTokensReceived(category.totalInvested)}
											</div>
										</div>
										<div>
											<span style={{ color: '#6c7281' }}>Value:</span>
											<div style={{ fontWeight: 600, color: '#1a1d29', fontFamily: '"SF Mono", monospace' }}>
												{formatTokensReceived(category.totalValue)}
											</div>
										</div>
										<div>
											<span style={{ color: '#6c7281' }}>ROI:</span>
											<div style={{ 
												fontWeight: 600, 
												color: getROIColor(category.roi),
												fontFamily: '"SF Mono", monospace'
											}}>
												{category.roi || '-'}
											</div>
										</div>
										<div>
											<span style={{ color: '#6c7281' }}>Count:</span>
											<div style={{ fontWeight: 600, color: '#1a1d29' }}>
												{category.investmentsCount}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Performance by Blockchain Category */}
				<div style={{ 
					backgroundColor: '#ffffff',
					border: '1px solid #e1e5e9',
					borderRadius: '8px',
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
							Performance by Blockchain Category
						</h3>
						<p style={{ 
							fontSize: '13px', 
							color: '#6c7281', 
							margin: 0,
							fontWeight: 400
						}}>
							Detailed performance metrics for each category
						</p>
					</div>
					
					<div style={{ padding: '24px' }}>
						<div style={{ 
							border: '1px solid #e1e5e9',
							borderRadius: '6px',
							overflow: 'hidden'
						}}>
							<table style={{ 
								width: '100%', 
								borderCollapse: 'collapse',
								fontSize: '13px',
								fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
											color: '#6c7281' 
										}}>
											Category
										</th>
										<th style={{ 
											textAlign: 'right', 
											padding: '12px 16px', 
											fontWeight: 500, 
											fontSize: '11px', 
											letterSpacing: '0.02em', 
											textTransform: 'uppercase', 
											color: '#6c7281' 
										}}>
											Total Invested
										</th>
										<th style={{ 
											textAlign: 'right', 
											padding: '12px 16px', 
											fontWeight: 500, 
											fontSize: '11px', 
											letterSpacing: '0.02em', 
											textTransform: 'uppercase', 
											color: '#6c7281' 
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
											color: '#6c7281' 
										}}>
											Realised P&L
										</th>
										<th style={{ 
											textAlign: 'right', 
											padding: '12px 16px', 
											fontWeight: 500, 
											fontSize: '11px', 
											letterSpacing: '0.02em', 
											textTransform: 'uppercase', 
											color: '#6c7281' 
										}}>
											ROI
										</th>
										<th style={{ 
											textAlign: 'right', 
											padding: '12px 16px', 
											fontWeight: 500, 
											fontSize: '11px', 
											letterSpacing: '0.02em', 
											textTransform: 'uppercase', 
											color: '#6c7281' 
										}}>
											Investments
										</th>
									</tr>
								</thead>
								<tbody>
									{blockchainCategories.map((category, index) => (
										<tr key={category.category} style={{ 
											backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
											borderBottom: index < blockchainCategories.length - 1 ? '1px solid #f1f3f4' : 'none'
										}}>
											<td style={{ 
												padding: '12px 16px', 
												fontWeight: 500, 
												color: '#1a1d29' 
											}}>
												{category.category}
											</td>
											<td style={{ 
												padding: '12px 16px', 
												textAlign: 'right', 
												fontWeight: 500, 
												color: '#1a1d29',
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{formatTokensReceived(category.totalInvested)}
											</td>
											<td style={{ 
												padding: '12px 16px', 
												textAlign: 'right', 
												fontWeight: 500, 
												color: '#1a1d29',
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{formatTokensReceived(category.totalValue)}
											</td>
											<td style={{ 
												padding: '12px 16px', 
												textAlign: 'right', 
												fontWeight: 500, 
												color: '#1a1d29',
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{formatTokensReceived(category.realisedPnL)}
											</td>
											<td style={{ 
												padding: '12px 16px', 
												textAlign: 'right', 
												fontWeight: 500, 
												color: getROIColor(category.roi),
												fontFamily: '"SF Mono", "Monaco", monospace'
											}}>
												{category.roi || '-'}
											</td>
											<td style={{ 
												padding: '12px 16px', 
												textAlign: 'right', 
												fontWeight: 500, 
												color: '#6c7281'
											}}>
												{category.investmentsCount}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
			`}</style>
		</div>
	);
}
