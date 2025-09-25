// Refresh function to update all data sources
function refreshAllData() {
  importHatomData();
  importOrdiswapData();
  importSenecaData();
  importEthereumData();
  importSolData();
  importOmnixData(); 
  importOrangeData();
  importTadaData();
  importOrlaData();
  importBeobleData();
  importOrdiBankData();
  importTunaData();
  importTarsData();
  importElixirData();
  importPixelverseData();
  importBorpaData();
  importNavyAIData();
  importTornadoData();
  importNaymsData();
  imporMemefiData();
  importPeaqData();
  importTapData();
  importDojoData();
  importAIMarketCompassData();
  importCTAData();
  importHeuristData();
  importGaspData();
  importHumanityData();
  importAssisterrData();
  importCreatorbidData();
  importChirpData();
  importHybridData();
  importInferiumData();
  importGizaData();
  importPumpData();
}

function doGet(e) {
  try {
    const token = e && e.parameter ? e.parameter.token : null;
    if (token !== 'blueeyeswillrule') {
      return ContentService.createTextOutput('{"error":"Unauthorized"}')
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle refresh request
    const refresh = e && e.parameter ? e.parameter.refresh : null;
    if (refresh === 'true') {
      try {
        console.log('Refresh request received, calling refreshAllData()');
        refreshAllData();
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'All data refreshed successfully',
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
        
      } catch (error) {
        console.error('Refresh failed:', error);
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Refresh failed: ' + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
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
    
    // Get main investment data dynamically - find the last row with data in column B
    // Start from B15 and scan down to find the actual end of data
    const startRow = 15;
    const startCol = 2; // Column B
    const maxCols = 17; // Up to column R (B=2, so R=18, so 17 columns from B)
    
    // First, find the last row with data in column B
    let lastRow = startRow;
    for (let row = startRow; row <= 100; row++) { // Scan up to row 100 to be safe
      const cellValue = sheet.getRange(row, startCol).getValue();
      if (cellValue && cellValue.toString().trim() !== '' && 
          !cellValue.toString().includes('Fundamental Global Inc') && 
          !cellValue.toString().includes('NewOS') &&
          !cellValue.toString().match(/^\$[\d,]+$/)) { // Exclude cells that are just dollar amounts (likely totals)
        lastRow = row;
      } else if (row > startRow + 5) { // If we've gone 5 rows without data after the start, stop
        break;
      }
    }
    
    console.log(`Dynamic range detection: B${startRow}:R${lastRow} (${lastRow - startRow + 1} rows)`);
    
    // Get the dynamic range from B15 to R[lastRow]
    const values = sheet.getRange(`B${startRow}:R${lastRow}`).getValues();
    const investments = [];
    
    // Skip row 15 (headers), start from row 16 (index 1)
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const name = row[0] ? row[0].toString().trim() : ''; // Column B (index 0)
      
      if (!name || name === 'Fundamental Global Inc' || name === 'NewOS' || 
          name.match(/^\$[\d,]+$/) || row[0] === '') { // Skip rows with just dollar amounts
        break;
      }
      
      // Debug: Log the row data for the first few investments
      if (i <= 3) {
        console.log(`Row ${i + startRow}: Name=${name}, BuyPrice=${row[13]}, CurrentPrice=${row[14]}, AvgSellPrice=${row[15]}, Vesting=${row[16]}`);
      }
      
      investments.push({
        name: name,
        totalInvested: row[1] ? row[1].toString() : '',        // Column C
        totalValue: row[2] ? row[2].toString() : '',           // Column D
        realisedValue: row[3] ? row[3].toString() : '',        // Column E
        realisedPnL: row[4] ? row[4].toString() : '',          // Column F
        roi: row[5] ? row[5].toString() : '',                  // Column G
        realisedRoi: row[6] ? row[6].toString() : '',          // Column H
        percentReceived: row[7] ? row[7].toString() : '',      // Column I
        percentSold: row[8] ? row[8].toString() : '',          // Column J
        liquidValue: row[9] ? row[9].toString() : '',          // Column K
        nextUnlock: row[10] ? row[10].toString() : '',         // Column L
        nextUnlock2: row[11] ? row[11].toString() : '',        // Column M
        fullUnlock: row[12] ? row[12].toString() : '',         // Column N
        buyPrice: row[13] ? row[13].toString() : '',           // Column O
        currentPrice: row[14] ? row[14].toString() : '',       // Column P
        avgSellPrice: row[15] ? row[15].toString() : '',       // Column Q (new)
        vesting: row[16] ? row[16].toString() : ''             // Column R (moved from Q)
      });
    }
    
    // ===== BLOCKCHAIN CATEGORIES DATA (DYNAMIC) =====
    
    let blockchainCategories = [];
    
    if (includeBlockchainCategories) {
      try {
        // Get blockchain category data from B157:M212
        const categoryValues = sheet.getRange('B157:M212').getValues();
        
        // Calculate total invested for percentage calculations
        let totalPortfolioInvested = 0;
        investments.forEach(inv => {
          const invested = parseFloat(inv.totalInvested.replace(/[$,]/g, '') || 0);
          if (!isNaN(invested)) totalPortfolioInvested += invested;
        });
        
        // Read ROI data from the new table at P168 onwards
        const roiTableValues = sheet.getRange('P168:R180').getValues(); // Adjust range as needed
        const roiLookup = {};
        
        // Process ROI table (skip header row)
        for (let i = 1; i < roiTableValues.length; i++) {
          const roiRow = roiTableValues[i];
          const categoryName = roiRow[0] ? roiRow[0].toString().trim() : '';
          const realisedROI = roiRow[1] ? roiRow[1].toString().trim() : '';
          const unrealisedROI = roiRow[2] ? roiRow[2].toString().trim() : '';
          
          if (categoryName && categoryName !== '') {
            roiLookup[categoryName] = {
              realisedRoi: realisedROI,
              unrealisedRoi: unrealisedROI
            };
          }
        }
        
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
          const mainInvestment = row[2] ? row[2].toString().trim() : '';
          const totalInvested = row[3] ? row[3].toString() : '';
          const totalInvestedPercentage = row[4] ? row[4].toString() : '';
          const totalValue = row[5] ? row[5].toString() : '';
          const totalValuePercentage = row[6] ? row[6].toString() : '';
          const realisedValue = row[7] ? row[7].toString() : '';
          const unrealisedValue = row[8] ? row[8].toString() : '';
          const realisedPnL = row[9] ? row[9].toString() : '';
          const roi = row[10] ? row[10].toString() : '';
          // We'll get the correct ROI values from the P168 table later
          let unrealisedRoi = '';
          let realisedRoi = '';
          
          // Calculate percentage of total portfolio
          const totalInvestedNum = parseFloat(totalInvested.replace(/[$,]/g, '') || 0);
          const percentage = totalPortfolioInvested > 0 ? 
            (totalInvestedNum / totalPortfolioInvested) * 100 : 0;
          
          // Dynamically find all investments for this category by looking for investments
          // that appear in the main investments list and could belong to this category
          const categoryInvestmentsList = [];
          
          // Add the main investment if it exists
          if (mainInvestment && mainInvestment !== '') {
            categoryInvestmentsList.push(mainInvestment);
          }
          
          // Look for additional investments in this category by scanning the sheet
          // We'll look in the rows below the main category row for additional investments
          let currentRow = i + 1;
          while (currentRow < categoryValues.length) {
            const nextRow = categoryValues[currentRow];
            const nextCategory = nextRow[0] ? nextRow[0].toString().trim() : '';
            const nextInvestment = nextRow[2] ? nextRow[2].toString().trim() : '';
            
            // If we hit another category or empty row, stop
            if (nextCategory !== '' && nextCategory !== category) {
              break;
            }
            
            // If there's an investment name in column C and no category in column A, 
            // it belongs to the current category
            if (nextCategory === '' && nextInvestment !== '' && nextInvestment !== mainInvestment) {
              categoryInvestmentsList.push(nextInvestment);
            }
            
            currentRow++;
          }
          
          // Also try to match investments from the main investment list based on common patterns
          // This is a fallback to ensure we capture all investments even if the sheet structure varies
          const categoryLower = category.toLowerCase();
          investments.forEach(inv => {
            const invName = inv.name;
            
            // Skip if already added
            if (categoryInvestmentsList.includes(invName)) {
              return;
            }
            
            // Try to match based on category-specific patterns
            let shouldInclude = false;
            
            switch (categoryLower) {
              case 'ai':
                shouldInclude = invName.toLowerCase().includes('ai') || 
                              invName.toLowerCase().includes('gpt') ||
                              invName.toLowerCase().includes('neural') ||
                              ['Ta-Da', 'Tars AI', 'Heurist', 'Navy AI', 'Rainfall', 'Oh Dot Xyz', 
                               'Hybrid', 'AI Market Compass', 'Inferium', 'Dojo', 'Aloha', 'Datai', 
                               'Assisterr', 'Creator Bid', 'Giza Seed', 'Giza Legion', 'Inference Labs', 
                               'Newcoin', 'GTV'].includes(invName);
                break;
              case 'defi':
                shouldInclude = ['Hatom', 'Seneca', 'Risk', 'Gasp', 'Kebapp', 'Chedar', 'Soul Protocol'].includes(invName);
                break;
              case 'gaming':
                shouldInclude = invName.toLowerCase().includes('game') || 
                              invName.toLowerCase().includes('gaming') ||
                              ['Elixir Gaming', 'PixelVerse', 'CTA'].includes(invName);
                break;
              case 'bots':
                shouldInclude = invName.toLowerCase().includes('bot') ||
                              ['Omnibot', 'Magibot', 'Tornado Blast'].includes(invName);
                break;
              case 'depin':
                shouldInclude = ['Chirp', 'Aethir (Nodes)', 'Peaq', 'Teneo'].includes(invName);
                break;
              case 'ordinals':
                shouldInclude = invName.toLowerCase().includes('ord') || 
                              invName.toLowerCase().includes('tap') ||
                              invName.toLowerCase().includes('orange') ||
                              ['TAP', 'Ordiswap', 'Orange', 'Ordi Launch', 'OrdiBank', 'TunaChain', 
                               'Orange Layer', 'Glyph Exchange', 'BitLiquidity', 'Unitap'].includes(invName);
                break;
              case 'rwa':
                shouldInclude = ['Nayms'].includes(invName);
                break;
              case 'deso':
                shouldInclude = ['Beoble', 'Open Social'].includes(invName);
                break;
              case 'deid':
                shouldInclude = ['Humanity'].includes(invName);
                break;
              case 'security':
                shouldInclude = ['Innerworks', 'Holonym'].includes(invName);
                break;
              case 'meme':
                shouldInclude = ['Borpa', 'MemeFi'].includes(invName);
                break;
              case 'dats':
                shouldInclude = ['Ethereum Global Inc'].includes(invName);
                break;
            }
            
            if (shouldInclude) {
              categoryInvestmentsList.push(invName);
            }
          });
          
          // Remove duplicates and empty entries
          const uniqueInvestments = [...new Set(categoryInvestmentsList.filter(inv => inv && inv.trim() !== ''))];
          
          // Get ROI values from the lookup table
          const roiData = roiLookup[category];
          if (roiData) {
            realisedRoi = roiData.realisedRoi;
            unrealisedRoi = roiData.unrealisedRoi;
          }
          
          blockchainCategories.push({
            category: category,
            totalInvested: totalInvested,
            totalValue: totalValue,
            realisedValue: realisedValue,
            realisedPnL: realisedPnL,
            unrealisedValue: unrealisedValue,
            roi: roi,
            realisedRoi: realisedRoi,      // From P168 table
            unrealisedRoi: unrealisedRoi,  // From P168 table
            investmentCount: investmentCount,
            investments: uniqueInvestments,
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
    let individualVestingData = {};
    
    try {
      // Get vesting data from A50:S105 (56 rows total) - but focus on row 76 onwards for proper calculation
      const vestingValues = vestingSheet.getRange('A50:S105').getValues();
      
      // Also get individual portfolio vesting data
      // Scan for individual portfolio sections starting around row 110
      const individualVestingValues = vestingSheet.getRange('A110:T200').getValues();
      
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
      
      // Process vesting data using proper row-by-row differences
      const monthlyVesting = {};
      const allDates = [];
      
      // Collect all dates and their data (including past months for comparison)
      const allMonthsData = [];
      
      for (let i = 1; i < vestingValues.length; i++) {
        const row = vestingValues[i];
        const dateValue = row[0];
        
        if (!dateValue) continue;
        
        // Parse date
        let rowDate;
        try {
          if (dateValue instanceof Date) {
            rowDate = new Date(dateValue);
          } else {
            const dateStr = dateValue.toString();
            const parts = dateStr.split('/');
            
            if (parts.length === 3) {
              let month = parseInt(parts[0]);
              let day = parseInt(parts[1]);
              let year = parseInt(parts[2]);
              
              if (year < 100) {
                year += 2000;
              }
              
              rowDate = new Date(year, month - 1, day);
            }
          }
        } catch (e) {
          continue;
        }
        
        // Include ALL dates (past and future) for proper comparison
        if (rowDate) {
          const monthKey = rowDate.getFullYear() + '-' + String(rowDate.getMonth() + 1).padStart(2, '0');
          const isFuture = rowDate >= today;
          
          // Store the raw data for this month
          const monthData = { 
            month: monthKey, 
            rowIndex: i, 
            data: {},
            isFuture: isFuture,
            date: rowDate
          };
          
          // Debug: Log which sheet row we're processing
          if (isFuture) {
            console.log(`DEBUG: Processing ${monthKey} from sheet row ${i + 50} (array index ${i}) - FUTURE`);
          }
          
          Object.keys(topPerformers).forEach(projectName => {
            const colIndex = topPerformers[projectName];
            const value = row[colIndex];
            
            let numValue = 0;
            if (value !== null && value !== undefined && value !== '') {
              if (typeof value === 'number') {
                numValue = value;
              } else {
                const cleanValue = value.toString().replace(/[$,\s]/g, '');
                numValue = parseFloat(cleanValue) || 0;
              }
            }
            
            monthData.data[projectName] = numValue;
          });
          
          allMonthsData.push(monthData);
        }
      }
      
      // Sort all months chronologically
      allMonthsData.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Filter to get only future months for final output
      const futureMonthsData = allMonthsData.filter(m => m.isFuture);
      
      // Sort by month chronologically
      futureMonthsData.sort((a, b) => a.month.localeCompare(b.month));
      
      // Now calculate monthly deltas using proper previous month lookup
      futureMonthsData.forEach((monthData, index) => {
        const monthKey = monthData.month;
        monthlyVesting[monthKey] = {};
        allDates.push(monthKey);
        
        Object.keys(topPerformers).forEach(projectName => {
          const currentValue = monthData.data[projectName] || 0;
          
          // Find the actual previous month in allMonthsData (not just futureMonthsData)
          const currentIndex = allMonthsData.findIndex(m => m.month === monthKey);
          const previousMonthData = currentIndex > 0 ? allMonthsData[currentIndex - 1] : null;
          const previousValue = previousMonthData ? (previousMonthData.data[projectName] || 0) : 0;
          
          // Calculate monthly delta
          const monthlyAmount = Math.max(0, currentValue - previousValue);
          monthlyVesting[monthKey][projectName] = monthlyAmount;
          
          // Debug logging for first few months and specific projects
          if (index < 3 || ['Peaq', 'Tars', 'Giza Seed', 'Giza Legion'].includes(projectName)) {
            const prevMonth = previousMonthData ? previousMonthData.month : 'NONE';
            console.log(`DEBUG: ${projectName} ${monthKey} (future index ${index}): current=${currentValue}, previous=${previousValue} (from ${prevMonth}), monthly=${monthlyAmount}`);
          }
        });
      });
      
      // Sort dates chronologically
      allDates.sort();
      
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
        
      // ===== PROCESS INDIVIDUAL PORTFOLIO VESTING DATA =====
      
      // Process individual portfolio vesting data
      let currentPortfolioManager = null;
      let currentDateRowIndex = -1;
      
      console.log('Processing individual vesting data, scanning', individualVestingValues.length, 'rows');
      
      for (let i = 0; i < individualVestingValues.length; i++) {
        const row = individualVestingValues[i];
        const cellA = row[0] ? row[0].toString().trim() : '';
        
        // Check if this is a portfolio manager name (single name in column A)
        if (cellA && !cellA.includes('/') && !cellA.includes('Date') && !cellA.includes('Share') && 
            ['Zohair', 'Matthias', 'Iaad', 'Babak', 'Mikado'].includes(cellA)) {
          currentPortfolioManager = cellA.toLowerCase();
          
          // Handle name mappings (Mikado -> Iaad)
          if (currentPortfolioManager === 'mikado') {
            currentPortfolioManager = 'iaad';
          }
          
          individualVestingData[currentPortfolioManager] = [];
          currentDateRowIndex = -1;
          console.log('Found portfolio manager:', currentPortfolioManager, 'at row', i + 110);
        }
        
        // Check if this is a date row (starts with date pattern like "1/9/23")
        else if (cellA && cellA.includes('/') && currentPortfolioManager) {
          if (currentDateRowIndex === -1) {
            // This is the first date row, find the header to get column mapping
            currentDateRowIndex = i;
            console.log('First date row for', currentPortfolioManager, ':', cellA);
          }
          
          // Parse the date
          let rowDate;
          try {
            const dateStr = cellA.toString();
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              let month = parseInt(parts[0]);
              let day = parseInt(parts[1]);
              let year = parseInt(parts[2]);
              if (year < 100) year += 2000;
              rowDate = new Date(year, month - 1, day);
            }
          } catch (e) {
            continue;
          }
          
          // Only include future dates
          if (rowDate && rowDate >= today) {
            const monthKey = rowDate.getFullYear() + '-' + String(rowDate.getMonth() + 1).padStart(2, '0');
            
            // Extract vesting amounts for each project (columns B through S)
            const monthData = { month: monthKey };
            Object.keys(topPerformers).forEach(projectName => {
              const colIndex = topPerformers[projectName];
              const value = row[colIndex];
              let numValue = 0;
              if (value !== null && value !== undefined && value !== '') {
                if (typeof value === 'number') {
                  numValue = value;
                } else {
                  const cleanValue = value.toString().replace(/[$,\s]/g, '');
                  numValue = parseFloat(cleanValue) || 0;
                }
              }
              monthData[projectName] = numValue;
            });
            
            individualVestingData[currentPortfolioManager].push(monthData);
          }
        }
      }
      
      // Convert cumulative to monthly deltas for each portfolio manager using row-by-row differences
      Object.keys(individualVestingData).forEach(manager => {
        const data = individualVestingData[manager];
        
        // Convert to monthly deltas using row-by-row differences
        individualVestingData[manager] = data.map((monthData, index) => {
          const deltaData = { month: monthData.month };
          
          Object.keys(topPerformers).forEach(project => {
            const currentValue = monthData[project] || 0;
            const previousValue = index > 0 ? (data[index - 1][project] || 0) : 0;
            
            // Calculate the difference (monthly vesting amount)
            const monthlyAmount = Math.max(0, currentValue - previousValue);
            deltaData[project] = monthlyAmount;
          });
          
          return deltaData;
        }).filter(monthData => {
          // Only include months with actual vesting
          const total = Object.keys(topPerformers).reduce((sum, project) => 
            sum + (monthData[project] || 0), 0
          );
          return total > 0;
        });
      });
      
      // Debug: Log final individual vesting data
      console.log('Final individual vesting data:', Object.keys(individualVestingData));
      Object.keys(individualVestingData).forEach(manager => {
        console.log(`${manager}: ${individualVestingData[manager].length} months`);
      });
        
    } catch (vestingError) {
      // If vesting processing fails, continue with empty array but log error
      console.error('Vesting processing error:', vestingError);
      vestingData = [];
      individualVestingData = {};
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
    
    // Read overview totals directly from specific cells in the Overview tab
    // These cells contain the correct calculated totals from the spreadsheet
    const totalInvestedFromSheet = sheet.getRange('C6').getValue(); // Total Invested from C6
    const totalValueFromSheet = sheet.getRange('C7').getValue(); // Total Value from C7
    const realisedValueFromSheet = sheet.getRange('C8').getValue(); // Realised Value from C8
    const realisedPnLFromSheet = sheet.getRange('F6').getValue(); // Realised P&L from F6
    const realisedRoiFromSheet = sheet.getRange('I7').getValue(); // Realised ROI from I7
    const liquidValueFromSheet = sheet.getRange('F8').getValue(); // Liquid Value from F8
    const unrealisedPnLFromSheet = sheet.getRange('I10').getValue(); // Unrealised P&L from I10
    
    // Helper function to format currency values from sheet
    function formatSheetCurrency(value) {
      if (!value && value !== 0) return '';
      const numValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[$,]/g, ''));
      if (isNaN(numValue)) return '';
      return '$' + Math.round(numValue).toLocaleString();
    }
    
    // Helper function to calculate ROI
    function calculateROI(totalValue, totalInvested) {
      const valueNum = typeof totalValue === 'number' ? totalValue : parseFloat(totalValue.toString().replace(/[$,]/g, ''));
      const investedNum = typeof totalInvested === 'number' ? totalInvested : parseFloat(totalInvested.toString().replace(/[$,]/g, ''));
      if (isNaN(valueNum) || isNaN(investedNum) || investedNum === 0) return '';
      return (valueNum / investedNum).toFixed(2) + 'x';
    }
    
    const overview = {
      totalInvested: formatSheetCurrency(totalInvestedFromSheet),
      totalValue: formatSheetCurrency(totalValueFromSheet),
      realisedValue: formatSheetCurrency(realisedValueFromSheet),
      realisedPnL: formatSheetCurrency(realisedPnLFromSheet),
      unrealisedValue: totalValueFromSheet ? totalValueFromSheet.toString() : '', // Use C7 directly
      liquidValue: formatSheetCurrency(liquidValueFromSheet),
      roi: calculateROI(totalValueFromSheet, totalInvestedFromSheet),
      realisedRoi: realisedRoiFromSheet ? realisedRoiFromSheet.toString() : '', // Use I7 directly
      unrealisedPnL: unrealisedPnLFromSheet ? unrealisedPnLFromSheet.toString() : '', // Use I10 directly
      percentReceived: tokensReceivedData[1][0] ? tokensReceivedData[1][0].toString() : '',
      percentSold: '',
      investmentsCount: investments.length,
      listedCount: countsData[1][0] ? parseInt(countsData[1][0]) : null,
      nonListedCount: countsData[2][0] ? parseInt(countsData[2][0]) : null,
      tokensReceived: tokensReceivedData[0][0] ? tokensReceivedData[0][0].toString() : '',
      tokensReceivedPercentage: tokensReceivedData[1][0] ? tokensReceivedData[1][0].toString() : ''
    };
    
    // ===== INDIVIDUAL PORTFOLIOS (DYNAMIC DETECTION) =====
    
    function detectIndividualPortfolios() {
      // Start scanning from row 230 onwards to find portfolio sections
      const startRow = 230;
      const maxRows = 500; // Scan up to 500 rows to be safe
      const scanRange = sheet.getRange(startRow, 2, maxRows, 17); // B230:R730 (extended to include Outstanding Distributions)
      const scanData = scanRange.getValues();
      
      const portfolios = {};
      let currentPortfolio = null;
      let currentInvestments = [];
      
      for (let i = 0; i < scanData.length; i++) {
        const row = scanData[i];
        const cellB = row[0] ? row[0].toString().trim() : '';
        const cellC = row[1] ? row[1].toString().trim() : '';
        
        // Check if this is a portfolio name (big name in column B, empty in column C)
        if (cellB !== '' && cellC === '') {
          // Save previous portfolio if exists
          if (currentPortfolio) {
            portfolios[currentPortfolio.key] = {
              name: currentPortfolio.name,
              investments: [...currentInvestments],
              summary: currentPortfolio.summary
            };
          }
          
          // Start new portfolio
          let portfolioKey = cellB.toLowerCase().replace(/\s+/g, '');
          
          // Handle name mappings (Mikado -> Iaad)
          if (portfolioKey === 'mikado') {
            portfolioKey = 'iaad';
          }
          
          console.log('Found individual portfolio:', cellB, '-> key:', portfolioKey, 'at row', startRow + i);
          currentPortfolio = {
            key: portfolioKey,
            name: cellB,
            startRow: startRow + i,
            summary: null
          };
          currentInvestments = [];
          
        } else if (cellB !== '' && cellC !== '' && currentPortfolio) {
          // This is an investment row (has data in both B and C)
          const investment = {
            name: cellB,
            totalInvested: row[1] ? row[1].toString() : '',        // Column C
            share: row[2] ? row[2].toString() : '',                // Column D
            totalValue: row[3] ? row[3].toString() : '',           // Column E
            realisedValue: row[4] ? row[4].toString() : '',        // Column F
            unrealisedValue: row[5] ? row[5].toString() : '',      // Column G
            realisedPnL: row[6] ? row[6].toString() : '',          // Column H
            unrealisedRoi: row[7] ? row[7].toString() : '',        // Column I (renamed from roi)
            realisedRoi: row[8] ? row[8].toString() : '',          // Column J
            outstandingUSDC: row[9] ? row[9].toString() : '',      // Column K (Outstanding Distributions USDC)
            outstandingETH: row[10] ? row[10].toString() : '',     // Column L (Outstanding Distributions ETH)
            outstandingSOL: row[11] ? row[11].toString() : '',     // Column M (Outstanding Distributions SOL)
            liquidValue: row[12] ? row[12].toString() : '',        // Column N
            dpi: row[13] ? row[13].toString() : '',                // Column O (DPI)
            // Note: Columns P, Q, R available for future use
            withdrawUSD: row[14] ? row[14].toString() : '',        // Column P (moved from K)
            withdrawETH: row[15] ? row[15].toString() : '',        // Column Q (moved from L)
            withdrawSOL: row[16] ? row[16].toString() : ''         // Column R (moved from M)
          };
          currentInvestments.push(investment);
          
        } else if (cellB === '' && cellC !== '' && currentPortfolio && currentInvestments.length > 0) {
          // This might be a summary row (empty B, but has totals in other columns)
          const summaryRow = startRow + i + 1; // Convert to actual sheet row number
          
          currentPortfolio.summary = {
            totalInvested: row[1] ? row[1].toString() : '',
            share: row[2] ? row[2].toString() : '',
            totalValue: row[3] ? row[3].toString() : '',
            realisedValue: row[4] ? row[4].toString() : '',
            unrealisedValue: row[5] ? row[5].toString() : '',
            realisedPnL: row[6] ? row[6].toString() : '',
            unrealisedRoi: row[7] ? row[7].toString() : '',        // Column I (renamed from roi)
            realisedRoi: row[8] ? row[8].toString() : '',
            outstandingUSDC: row[9] ? row[9].toString() : '',      // Column K (Outstanding Distributions USDC)
            outstandingETH: row[10] ? row[10].toString() : '',     // Column L (Outstanding Distributions ETH)
            outstandingSOL: row[11] ? row[11].toString() : '',     // Column M (Outstanding Distributions SOL)
            liquidValue: row[12] ? row[12].toString() : '',
            dpi: row[13] ? row[13].toString() : '',                // Column O (DPI)
            withdrawUSD: row[14] ? row[14].toString() : '',        // Column P (moved)
            withdrawETH: row[15] ? row[15].toString() : '',        // Column Q (moved)
            withdrawSOL: row[16] ? row[16].toString() : ''         // Column R (moved)
          };
        }
      }
      
      // Don't forget the last portfolio
      if (currentPortfolio) {
        portfolios[currentPortfolio.key] = {
          name: currentPortfolio.name,
          investments: [...currentInvestments],
          summary: currentPortfolio.summary
        };
      }
      
      // Debug: Log all found portfolios
      console.log('Individual portfolios detected:', Object.keys(portfolios));
      Object.keys(portfolios).forEach(key => {
        const portfolio = portfolios[key];
        console.log(`${key}: ${portfolio.name}, ${portfolio.investments.length} investments, summary: ${portfolio.summary ? 'yes' : 'no'}`);
      });
      
      return portfolios;
    }
    
    const individualPortfolios = detectIndividualPortfolios();
    
    // ===== RETURN COMPLETE DATA WITH BLOCKCHAIN CATEGORIES =====
    
    const responseData = {
      overview: overview,
      investments: investments,
      listedProjects: listedProjects,
      individualPortfolios: individualPortfolios,
      vestingChart: vestingData,
      individualVestingData: individualVestingData
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
