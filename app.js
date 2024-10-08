let portfolioData = [
  {
    name: 'BTC',
    price: 60000,
    quantity: 5,
    manualPercentage: false,
  },
  { name: 'ETH', price: 2400, quantity: 20, manualPercentage: false },
  { name: 'BNB', price: 550, quantity: 6, manualPercentage: false },
  { name: 'SOL', price: 140, quantity: 50, manualPercentage: false },
  { name: 'DOGE', price: 0.01216, quantity: 20000, manualPercentage: false },
];

let targetValue = 1000000;

function calculatePortfolio() {
  let totalValue = 0;

  // Calculate the total value of the portfolio
  portfolioData.forEach(token => {
    token.currentValue = token.price * token.quantity;
    totalValue += token.currentValue;
  });

  // Update the portfolio percentage, target price, and target value
  portfolioData.forEach(token => {
    if (!token.manualPercentage) {
      // Only recalculate percentage if it's not manually set
      token.portfolioPercentage = (token.currentValue / totalValue) * 100;
    }

    // Recalculate target price and target value (quantity stays unchanged)
    token.targetPrice =
      (token.currentValue +
        (targetValue - totalValue) * (token.currentValue / totalValue)) /
      token.quantity;
    token.targetValue = token.targetPrice * token.quantity;
  });

  updateTable();
}

function updateTable() {
  const tableBody = document.querySelector('#portfolioTable tbody');
  tableBody.innerHTML = '';

  portfolioData.forEach((token, index) => {
    const row = tableBody.insertRow();
    row.innerHTML = `
            <td class="token-name"><input type="text" value="${token.name
      }" onchange="updateData(${index}, 'name', this.value)"></td>
            <td><input type="number" step="0.00001" value="${token.price
      }" onchange="updateData(${index}, 'price', this.value)"></td>
            <td><input type="number" step="0.01" value="${token.quantity
      }" onchange="updateData(${index}, 'quantity', this.value)"></td>
            <td>$${token.currentValue.toFixed(2)}</td>
            <td><input type="number" step="0.01" value="${token.portfolioPercentage.toFixed(
        2
      )}" onchange="updatePortfolioPercentage(${index}, this.value)"></td>
            <td>$${token.targetPrice.toFixed(5)}</td>
            <td>$${token.targetValue.toFixed(2)}</td>
            <td><button class="delete-btn" onclick="deleteRow(${index})">Delete</button></td>
        `;
  });
}

function updatePortfolioPercentage(index, newPercentage) {
  let adjustedPercentage = parseFloat(newPercentage);

  if (adjustedPercentage >= 0 && adjustedPercentage <= 100) {
    // Set the new percentage and mark it as manually entered
    portfolioData[index].portfolioPercentage = adjustedPercentage;
    portfolioData[index].manualPercentage = true;

    // Calculate the token's target value based on the new percentage of the target portfolio
    portfolioData[index].targetValue = (adjustedPercentage / 100) * targetValue;

    // Calculate the target price by dividing the new target value by the unchanged quantity
    portfolioData[index].targetPrice = portfolioData[index].targetValue / portfolioData[index].quantity;

    // Calculate remaining target value for other tokens
    let remainingTargetValue = targetValue - portfolioData[index].targetValue;

    // Calculate total current value of non-manually adjusted tokens
    let remainingCurrentValue = portfolioData.reduce((sum, token, i) => {
      if (i !== index && !token.manualPercentage) {
        return sum + token.currentValue;
      }
      return sum;
    }, 0);

    // Redistribute the remaining target value across non-manual tokens
    portfolioData.forEach((token, i) => {
      if (i !== index && !token.manualPercentage) {
        let shareOfRemaining = token.currentValue / remainingCurrentValue;
        token.targetValue = remainingTargetValue * shareOfRemaining;
        token.targetPrice = token.targetValue / token.quantity;
        token.portfolioPercentage = (token.targetValue / targetValue) * 100;
      }
    });
  }

  // Update the table to reflect the changes
  updateTable();
}


function updateData(index, field, value) {
  portfolioData[index][field] = field === 'name' ? value : parseFloat(value);
  calculatePortfolio();
}

function addRow() {
  portfolioData.push({ name: 'New Token', price: 0, quantity: 0 });
  calculatePortfolio();
}

function deleteRow(index) {
  portfolioData.splice(index, 1);
  calculatePortfolio();
}

function updateTarget(value) {
  targetValue = parseFloat(value);
  calculatePortfolio();
}

document.addEventListener('DOMContentLoaded', () => {
  calculatePortfolio();
  document.getElementById('addRowBtn').addEventListener('click', addRow);
});
