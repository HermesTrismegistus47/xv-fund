function doGet(e) {
  try {
    const token = e && e.parameter ? e.parameter.token : null;
    if (token !== 'blueeyeswillrule') {
      return ContentService.createTextOutput('{"error":"Unauthorized"}')
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Overview');
    const vestingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Listing Vesting Chart');
    
    if (!sheet) {
      return ContentService.createTextOutput('{"error":"Overview sheet not found"}')
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!vestingSheet) {
      return ContentService.createTextOutput('{"error":"Listing Vesting Chart sheet not found"}')
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if blockchain categories are requested
    const includeBlockchainCategories = e && e.parameter && e.parameter.includeBlockchainCategories === 'true';
    
    // ===== EXISTING FUND DATA (keeping all existing code) =====
    
    // Get main investment data from A14:N70
    const values = sheet.getRange('A14:N70').getValues();
    const investments = [];
    
    // Skip row 14 (empty) and row 15 (headers), start from row 16 (index 2)
    for (let i = 2; i < values.length; i++) {
      const row = values[i];
      const name = row[1] ? row[1].toString().trim() : '';
      
      if (!name || name === 'Fundamental Global Inc' || name === 'NewOS' || 
          name.includes('$3,619,094') || row[1] === '') {
        break;
      }
      
      investments.push({
        name: name,
        totalInvested: row[2] ? row[2].toString() : '',
        totalValue: row[3] ? row[3].toString() : '',
        realisedValue: row[4] ? row[4].toString() : '',
        realisedPnL: row[5] ? row[5].toString() : '',
        roi: row[6] ? row[6].toString() : '',
        realisedRoi: row[7] ? row[7].toString() : '',
        percentReceived: row[8] ? row[8].toString() : '',
        percentSold: row[9] ? row[9].toString() : '',
        liquidValue: row[10] ? row[10].toString() : '',
        nextUnlock: row[11] ? row[11].toString() : '',
        nextUnlock2: row[12] ? row[12].toString() : '',
        fullUnlock: row[13] ? row[13].toString() : ''
      });
    }
    
    // ===== BLOCKCHAIN CATEGORIES DATA (NEW) =====
    
    let blockchainCategories = [];
    
    if (includeBlockchainCategories) {
      try {
        // Get blockchain category data from B157:M212 (row 158 has headers, data starts from row 159)
        const categoryValues = sheet.getRange('B157:M212').getValues();
        
        // Define the investment mappings for each category
        const categoryInvestments = {
          'DeFi': ['Hatom', 'Seneca', 'Risk', 'Gasp', 'Kebapp', 'Chedar', 'Soul Protocol'],
          'AI': ['Ta-Da', 'Navy AI', 'Tars AI', 'Heurist', 'Rainfall', 'Oh Dot Xyz', 'Hybrid', 'AI Market Compass', 'Inferium', 'Dojo', 'Aloha', 'Datai', 'Assisterr', 'Creator Bid', 'Giza Seed', 'Giza Legion', 'Inference Labs', 'Newcoin', 'GTV'],
          'Gaming': ['Elixir Gaming', 'PixelVerse', 'CTA'],
          'Bots': ['Omnibot', 'Magibot', 'Tornado Blast'],
          'DePIN': ['Chirp', 'Aethir (Nodes)', 'Peaq', 'Teneo'],
          'Ordinals': ['TAP', 'Ordiswap', 'Orange', 'Ordi Launch', 'OrdiBank', 'TunaChain', 'Orange Layer', 'Glyph Exchange', 'BitLiquidity', 'Unitap'],
          'RWA': ['Nayms'],
          'DeSo': ['Beoble', 'Open Social'],
          'DeId': ['Humanity'],
          'Security': ['Innerworks', 'Holonym'],
          'Meme': ['Borpa', 'MemeFi'],
          'DATs': ['Ethereum Global Inc']
        };
        
        // Calculate total invested for percentage calculations
        let totalPortfolioInvested = 0;
        investments.forEach(inv => {
          const invested = parseFloat(inv.totalInvested.replace(/[$,]/g, '') || 0);
          if (!isNaN(invested)) totalPortfolioInvested += invested;
        });
        
        // Process each category row (skip header row at index 0)
        for (let i = 1; i < categoryValues.length; i++) {
          const row = categoryValues[i];
          const category = row[0] ? row[0].toString().trim() : '';
          
          // Skip empty rows or total row
          if (!category || category === '' || category === 'Total' || row[1] === '' || !row[1]) {
            continue;
          }
          
          // Extract data from the row
          const investmentCount = row[1] ? parseInt(row[1].toString()) : 0;
          const totalInvested = row[3] ? row[3].toString() : '$0';
          const totalInvestedPercentage = row[4] ? row[4].toString() : '0%';
          const totalValue = row[5] ? row[5].toString() : '$0';
          const totalValuePercentage = row[6] ? row[6].toString() : '0%';
          const realisedValue = row[7] ? row[7].toString() : '$0';
          const unrealisedValue = row[8] ? row[8].toString() : '$0';
          const realisedPnL = row[9] ? row[9].toString() : '$0';
          const roi = row[10] ? row[10].toString() : '0x';
          const realisedRoi = row[11] ? row[11].toString() : '0x';
          
          // Calculate unrealised ROI
          const totalInvestedNum = parseFloat(totalInvested.replace(/[$,]/g, '') || 0);
          const unrealisedValueNum = parseFloat(unrealisedValue.replace(/[$,]/g, '') || 0);
          const unrealisedRoi = totalInvestedNum > 0 ? (unrealisedValueNum / totalInvestedNum).toFixed(2) + 'x' : '0x';
          
          // Calculate percentage of total portfolio
          const percentage = totalPortfolioInvested > 0 ? 
            (totalInvestedNum / totalPortfolioInvested) * 100 : 0;
          
          // Get investments for this category
          const categoryInvestmentsList = categoryInvestments[category] || [];
          
          blockchainCategories.push({
            category: category,
            totalInvested: totalInvested,
            totalValue: totalValue,
            realisedValue: realisedValue,
            realisedPnL: realisedPnL,
            unrealisedValue: unrealisedValue,
            roi: roi,
            realisedRoi: realisedRoi,
            unrealisedRoi: unrealisedRoi,
            investmentCount: investmentCount,
            investments: categoryInvestmentsList,
            percentage: percentage
          });
        }
        
      } catch (categoryError) {
        console.error('Blockchain category processing error:', categoryError);
        blockchainCategories = [];
      }
    }
    
    // ===== VESTING CHART DATA WITH MONTHLY DELTAS =====
    
    let vestingData = [];
    
    try {
      // Get vesting data from A50:S105 (56 rows total)
      const vestingValues = vestingSheet.getRange('A50:S105').getValues();
      
      // Top performer columns mapping (your specified projects)
      const topPerformers = {
        'Hatom': 1,       // Column B
        'Tap': 2,         // Column C  
        'Peaq': 3,        // Column D
        'Tars': 4,        // Column E
        'Tada': 6,        // Column G (skipping F which is Ordiswap)
        'CTA': 11,        // Column L
        'Heurist': 14,    // Column O
        'Humanity': 15,   // Column P
        'Giza Seed': 16,  // Column Q
        'Giza Legion': 17,// Column R
        'Creatorbid': 18  // Column S
      };
      
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison
      
      // Process vesting data and store cumulative values by project and date
      const cumulativeData = {};
      const allDates = [];
      
      // First pass: collect all data and dates
      for (let i = 1; i < vestingValues.length; i++) {
        const row = vestingValues[i];
        const dateValue = row[0];
        
        if (!dateValue) continue;
        
        // Parse date - handle both Date objects and string formats
        let rowDate;
        try {
          if (dateValue instanceof Date) {
            rowDate = new Date(dateValue);
          } else {
            // Handle string dates like "1/9/24", "12/31/24", etc.
            const dateStr = dateValue.toString();
            const parts = dateStr.split('/');
            
            if (parts.length === 3) {
              let month = parseInt(parts[0]);
              let day = parseInt(parts[1]);
              let year = parseInt(parts[2]);
              
              // Handle 2-digit years: assume 20xx for years 00-99
              if (year < 100) {
                year += 2000;
              }
              
              rowDate = new Date(year, month - 1, day); // month is 0-based
            }
          }
        } catch (e) {
          continue; // Skip invalid dates
        }
        
        // Only include future dates (from today onwards)
        if (rowDate && rowDate >= today) {
          const monthKey = rowDate.getFullYear() + '-' + String(rowDate.getMonth() + 1).padStart(2, '0');
          
          if (!cumulativeData[monthKey]) {
            cumulativeData[monthKey] = {};
            allDates.push(monthKey);
          }
          
          // Store cumulative values for each project
          Object.keys(topPerformers).forEach(projectName => {
            const colIndex = topPerformers[projectName];
            const value = row[colIndex];
            
            // Handle different value types (number, string with $, etc.)
            let numValue = 0;
            if (value !== null && value !== undefined && value !== '') {
              if (typeof value === 'number') {
                numValue = value;
              } else {
                // Clean currency values: remove $, commas, spaces
                const cleanValue = value.toString().replace(/[$,\s]/g, '');
                numValue = parseFloat(cleanValue) || 0;
              }
            }
            
            // Store the maximum cumulative value for this month/project
            if (!cumulativeData[monthKey][projectName] || numValue > cumulativeData[monthKey][projectName]) {
              cumulativeData[monthKey][projectName] = numValue;
            }
          });
        }
      }
      
      // Sort dates chronologically
      allDates.sort();
      
      // Second pass: calculate monthly deltas (vesting amounts)
      const monthlyVesting = {};
      const previousValues = {}; // Track previous month's cumulative values
      
      // Initialize previous values to 0
      Object.keys(topPerformers).forEach(project => {
        previousValues[project] = 0;
      });
      
      allDates.forEach(monthKey => {
        monthlyVesting[monthKey] = {};
        
        Object.keys(topPerformers).forEach(project => {
          const currentCumulative = cumulativeData[monthKey][project] || 0;
          const previousCumulative = previousValues[project] || 0;
          
          // Calculate delta: how much vested this month
          const monthlyAmount = Math.max(0, currentCumulative - previousCumulative);
          monthlyVesting[monthKey][project] = monthlyAmount;
          
          // Update previous value for next iteration
          if (currentCumulative > 0) {
            previousValues[project] = currentCumulative;
          }
        });
      });
      
      // Convert to array format for frontend, sorted by month
      vestingData = allDates
        .slice(0, 42) // Next 42 months (until March 2028)
        .map(month => ({
          month: month,
          ...monthlyVesting[month]
        }))
        .filter(monthData => {
          // Only include months with actual vesting
          const total = Object.keys(topPerformers).reduce((sum, project) => 
            sum + (monthData[project] || 0), 0
          );
          return total > 0;
        });
        
    } catch (vestingError) {
      // If vesting processing fails, continue with empty array but log error
      console.error('Vesting processing error:', vestingError);
      vestingData = [];
    }
    
    // ===== EXISTING CODE FOR OTHER DATA (keeping all existing) =====
    
    // Get Listed Projects data from K7:M9
    const listedProjectsRange = sheet.getRange('K7:M9');
    const listedProjectsData = listedProjectsRange.getValues();
    
    // Get investment counts from C10:C12
    const countsRange = sheet.getRange('C10:C12');
    const countsData = countsRange.getValues();
    
    // Get next unlock details from L9:N9
    const nextUnlockRange = sheet.getRange('L9:N9');
    const nextUnlockData = nextUnlockRange.getValues();
    
    // Get tokens received data from F10:F12
    const tokensReceivedRange = sheet.getRange('F10:F12');
    const tokensReceivedData = tokensReceivedRange.getValues();
    
    const listedProjects = {
      totalInvested: listedProjectsData[0][1] ? listedProjectsData[0][1].toString() : '',
      totalInvestedPercentage: listedProjectsData[0][2] ? listedProjectsData[0][2].toString() : '',
      totalValue: listedProjectsData[1][1] ? listedProjectsData[1][1].toString() : '',
      totalValuePercentage: listedProjectsData[1][2] ? listedProjectsData[1][2].toString() : '',
      nextUnlock: listedProjectsData[2][1] ? listedProjectsData[2][1].toString() : '',
      nextUnlockDays: listedProjectsData[2][2] ? listedProjectsData[2][2].toString() : '',
      // Investment counts
      totalInvestments: countsData[0][0] ? countsData[0][0].toString() : '',
      listedCount: countsData[1][0] ? countsData[1][0].toString() : '',
      nonListedCount: countsData[2][0] ? countsData[2][0].toString() : '',
      // Next unlock details
      nextUnlockAmount: nextUnlockData[0][0] ? nextUnlockData[0][0].toString() : '',
      nextUnlockDaysDetailed: nextUnlockData[0][1] ? nextUnlockData[0][1].toString() : '',
      nextUnlockProject: nextUnlockData[0][2] ? nextUnlockData[0][2].toString() : '',
      // Tokens received
      tokensReceived: tokensReceivedData[0][0] ? tokensReceivedData[0][0].toString() : '',
      tokensReceivedPercentage: tokensReceivedData[1][0] ? tokensReceivedData[1][0].toString() : '',
      tokensReceivedROI: tokensReceivedData[2][0] ? tokensReceivedData[2][0].toString() : ''
    };
    
    // Calculate overview from actual data
    let totalInvested = 0;
    let totalValue = 0;
    let realisedValue = 0;
    let realisedPnL = 0;
    let liquidValue = 0;
    
    investments.forEach(inv => {
      const invested = parseFloat(inv.totalInvested.replace(/[$,]/g, '') || 0);
      const value = parseFloat(inv.totalValue.replace(/[$,]/g, '') || 0);
      const realised = parseFloat(inv.realisedValue.replace(/[$,]/g, '') || 0);
      const pnl = parseFloat(inv.realisedPnL.replace(/[$,]/g, '') || 0);
      const liquid = parseFloat(inv.liquidValue.replace(/[$,]/g, '') || 0);
      
      if (!isNaN(invested)) totalInvested += invested;
      if (!isNaN(value)) totalValue += value;
      if (!isNaN(realised)) realisedValue += realised;
      if (!isNaN(pnl)) realisedPnL += pnl;
      if (!isNaN(liquid)) liquidValue += liquid;
    });
    
    const overview = {
      totalInvested: '$' + totalInvested.toLocaleString(),
      totalValue: '$' + totalValue.toLocaleString(),
      realisedValue: '$' + realisedValue.toLocaleString(),
      realisedPnL: '$' + realisedPnL.toLocaleString(),
      unrealisedValue: '$' + (totalValue - realisedValue).toLocaleString(),
      liquidValue: '$' + liquidValue.toLocaleString(),
      roi: totalInvested > 0 ? (totalValue / totalInvested).toFixed(2) + 'x' : '0x',
      realisedRoi: totalInvested > 0 ? (realisedValue / totalInvested).toFixed(2) + 'x' : '0x',
      percentReceived: '',
      percentSold: '',
      investmentsCount: investments.length,
      listedCount: null,
      nonListedCount: null
    };
    
    // ===== INDIVIDUAL PORTFOLIOS (keeping existing code) =====
    
    const portfolioRanges = {
      zohair: { range: 'B231:N282', summaryRow: 283 },
      matthias: { range: 'B308:N349', summaryRow: 350 },
      iaad: { range: 'B374:N417', summaryRow: 418 },
      babak: { range: 'B443:N486', summaryRow: 487 },
      bahman: { range: 'B512:N535', summaryRow: 536 },
      victor: { range: 'B561:N611', summaryRow: 612 },
      karl: { range: 'B637:N684', summaryRow: 685 }
    };
    
    function getIndividualPortfolio(name, rangeStr, summaryRow) {
      const range = sheet.getRange(rangeStr);
      const data = range.getValues();
      
      const investments = [];
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const investmentName = row[0] ? row[0].toString().trim() : '';
        
        if (!investmentName || investmentName === '') {
          continue;
        }
        
        investments.push({
          name: investmentName,
          totalInvested: row[1] ? row[1].toString() : '',
          share: row[2] ? row[2].toString() : '',
          totalValue: row[3] ? row[3].toString() : '',
          realisedValue: row[4] ? row[4].toString() : '',
          unrealisedValue: row[5] ? row[5].toString() : '',
          realisedPnL: row[6] ? row[6].toString() : '',
          roi: row[7] ? row[7].toString() : '',
          realisedRoi: row[8] ? row[8].toString() : '',
          withdrawUSD: row[9] ? row[9].toString() : '',
          withdrawETH: row[10] ? row[10].toString() : '',
          withdrawSOL: row[11] ? row[11].toString() : '',
          liquidValue: row[12] ? row[12].toString() : ''
        });
      }
      
      const totalInvestedSummary = sheet.getRange(summaryRow, 3).getValue();
      const totalValueSummary = sheet.getRange(summaryRow, 5).getValue();
      const liquidValueSummary = sheet.getRange(summaryRow, 14).getValue();
      
      const summaryRange = sheet.getRange(summaryRow, 2, 1, 13);
      const summaryData = summaryRange.getValues()[0];
      
      const summary = {
        totalInvested: totalInvestedSummary ? totalInvestedSummary.toString() : '',
        share: summaryData[2] ? summaryData[2].toString() : '',
        totalValue: totalValueSummary ? totalValueSummary.toString() : '',
        realisedValue: summaryData[4] ? summaryData[4].toString() : '',
        unrealisedValue: summaryData[5] ? summaryData[5].toString() : '',
        realisedPnL: summaryData[6] ? summaryData[6].toString() : '',
        roi: summaryData[7] ? summaryData[7].toString() : '',
        realisedRoi: summaryData[8] ? summaryData[8].toString() : '',
        withdrawUSD: summaryData[9] ? summaryData[9].toString() : '',
        withdrawETH: summaryData[10] ? summaryData[10].toString() : '',
        withdrawSOL: summaryData[11] ? summaryData[11].toString() : '',
        liquidValue: liquidValueSummary ? liquidValueSummary.toString() : ''
      };
      
      return {
        name: name,
        range: rangeStr,
        investments: investments,
        summary: summary
      };
    }
    
    const individualPortfolios = {};
    
    Object.keys(portfolioRanges).forEach(key => {
      const config = portfolioRanges[key];
      individualPortfolios[key] = getIndividualPortfolio(
        key.charAt(0).toUpperCase() + key.slice(1),
        config.range,
        config.summaryRow
      );
    });
    
    // ===== RETURN COMPLETE DATA WITH BLOCKCHAIN CATEGORIES =====
    
    const responseData = {
      overview: overview,
      investments: investments,
      listedProjects: listedProjects,
      individualPortfolios: individualPortfolios,
      vestingChart: vestingData
    };
    
    // Only include blockchain categories if requested
    if (includeBlockchainCategories) {
      responseData.blockchainCategories = blockchainCategories;
    }
    
    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput('{"error":"' + error.toString() + '"}')
      .setMimeType(ContentService.MimeType.JSON);
  }
}
