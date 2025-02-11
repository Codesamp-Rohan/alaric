const cryptos = [
    { symbol: 'BTCUSDT', logo: './assets/btc.png' },
    { symbol: 'ETHUSDT', logo: './assets/eth.png' },
    { symbol: 'DOGEUSDT', logo: './assets/doge.png' },
    { symbol: 'XRPUSDT', logo: './assets/xrp.png' },
    { symbol: 'BNBUSDT', logo: './assets/bnb.png' },
    { symbol: 'LTCUSDT', logo: './assets/ltc.png' }
  ];
  
  const fetchCryptoData = async () => {
      for (let { symbol, logo } of cryptos) {
          let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=8`; 
          try {
              let response = await fetch(url);
              let data = await response.json();
              
              let prices = data.map(item => parseFloat(item[4])); 
              let price7DaysAgo = prices[0];
              let currentPrice = prices[prices.length - 1];
              let percentChange = ((currentPrice - price7DaysAgo) / price7DaysAgo) * 100;
  
              let row = document.createElement('tr');
  
              let symbolCell = document.createElement('td');
              symbolCell.classList.add('symbol');
              let logoImg = document.createElement('img');
              logoImg.src = logo;
              logoImg.alt = symbol.replace('USDT', '');
              logoImg.style.width = '20px'; 
              logoImg.style.height = '20px';
              symbolCell.appendChild(logoImg);
              symbolCell.appendChild(document.createTextNode(` ${symbol.replace('USDT', '')}`));
              row.appendChild(symbolCell);
  
              let priceCell = document.createElement('td');
              priceCell.textContent = `$${currentPrice.toFixed(2)}`;
              row.appendChild(priceCell);
  
              let changeCell = document.createElement('td');
              let percent = document.createElement('p');
              percent.textContent = `${percentChange.toFixed(2)}%`;
              percent.classList.add(`${percentChange >= 0 ? 'green-percent' : 'red-percent'}`);
              row.appendChild(changeCell);
              changeCell.appendChild(percent);
  
              let graphCell = document.createElement('td');
              let chartContainer = document.createElement('div');
              chartContainer.classList.add('chart-container');
              
              let canvas = document.createElement('canvas');
              canvas.style.width = '70px';
              canvas.style.height = '40px';
              chartContainer.appendChild(canvas);
              graphCell.appendChild(chartContainer);
              row.appendChild(graphCell);
  
              new Chart(canvas, {
                  type: 'line',
                  data: {
                      labels: data.map(item => new Date(item[0]).toLocaleDateString()),
                      datasets: [{
                          label: symbol.replace('USDT', ''),
                          data: prices,
                          borderColor: `${percentChange >= 0 ? '#1bb600' : '#ff0000'}`,
                          borderWidth: 7,
                          fill: false,
                          pointRadius: 0,
                          tension: 0.2
                      }]
                  },
                  options: {
                      responsive: false,
                      maintainAspectRatio: false,
                      plugins: {
                          legend: {
                              display: false
                          }
                      },
                      scales: {
                          x: {
                              display: false
                          },
                          y: {
                              display: false
                          }
                      }
                  }
              });
  
              document.querySelector('#cryptoTable tbody').appendChild(row);
  
          } catch (error) {
              console.error(`Error fetching data for ${symbol}:`, error);
          }
      }
  };
  
  fetchCryptoData();
  