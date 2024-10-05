document.addEventListener('DOMContentLoaded', () => {
    const depositBtn = document.getElementById('deposit-btn');
    const spinBtn = document.getElementById('spin-btn');
    const balanceDisplay = document.getElementById('balance');
    const reel1 = document.getElementById('reel1');
    const reel2 = document.getElementById('reel2');
    const reel3 = document.getElementById('reel3');
    const resultMessage = document.getElementById('result-message');
    const depositInput = document.getElementById('deposit');
    const betInput = document.getElementById('bet');
    const linesInput = document.getElementById('lines'); // Get lines input

    // Backend API URL
    const API_URL = 'http://localhost:3000';
    
    // Update the balance display
    function updateBalance(newBalance) {
        balanceDisplay.textContent = newBalance;
    }
    
    // Clear input fields after operation
    function clearInputs() {
        depositInput.value = '';
        betInput.value = '';
        linesInput.value = ''; // Clear lines input
    }
    
    // Handle deposit
    depositBtn.addEventListener('click', async () => {
        const depositAmount = parseFloat(depositInput.value); // Parse input to float
    
        if (isNaN(depositAmount) || depositAmount <= 0) {
            alert('Invalid deposit amount');
            return;
        }
    
        try {
            const response = await fetch(`${API_URL}/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: depositAmount }),
            });
    
            const data = await response.json();
            if (response.ok) {
                updateBalance(data.balance);
                clearInputs(); // Clear deposit input after successful deposit
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
    
    // Handle spin
    spinBtn.addEventListener('click', async () => {
        const betAmount = parseFloat(betInput.value); // Parse input to float
        const lines = parseInt(linesInput.value); // Get the number of lines
    
        if (isNaN(betAmount) || betAmount <= 0 || isNaN(lines) || lines <= 0) {
            alert('Invalid bet amount or number of lines');
            return;
        }
    
        try {
            const response = await fetch(`${API_URL}/spin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bet: betAmount, lines: lines }),
            });
    
            const data = await response.json();
            if (response.ok) {
                updateBalance(data.balance);
                reel1.textContent = data.reels[0].join(', '); // Show all symbols in reel
                reel2.textContent = data.reels[1].join(', ');
                reel3.textContent = data.reels[2].join(', ');
                resultMessage.textContent = data.winnings > 0
                    ? `You won $${data.winnings}!`
                    : 'No win, better luck next time!';
                clearInputs();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
