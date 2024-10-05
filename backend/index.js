const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow Cross-Origin requests
app.use(bodyParser.json()); // Parse incoming JSON

const SYMBOL_COUNT = {
    A: 2,
    B: 4,
    C: 6,
    D: 8,
};

const SYMBOL_VALUE = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
};

let balance = 0;

// Deposit function to add balance
const deposit = (amount) => {
    if (amount <= 0) {
        throw new Error("Invalid deposit amount");
    }
    balance += amount;
    return balance;
};

// Spin function to generate slot results
const spin = (lines) => {
    const reels = [];
    const symbols = [];

    // Build the symbols array based on SYMBOL_COUNT
    for (const [symbol, count] of Object.entries(SYMBOL_COUNT)) {
        for (let i = 0; i < count; i++) {
            symbols.push(symbol);
        }
    }

    // Generate 3 reels
    for (let i = 0; i < 3; i++) {
        reels.push([]);
        const reelsSymbols = [...symbols];
        for (let j = 0; j < 3; j++) {
            const randomIndex = Math.floor(Math.random() * reelsSymbols.length);
            reels[i].push(reelsSymbols[randomIndex]);
            reelsSymbols.splice(randomIndex, 1);
        }
    }

    return reels; // Return only the reels
};

// Calculate winnings based on matched rows
const calculateWinnings = (rows, bet, lines) => {
    let winnings = 0;

    for (let i = 0; i < lines; i++) {
        if (i < rows.length) { // Ensure we don't go out of bounds
            const row = rows[i]; // Get the row for the current line
            const firstSymbol = row[0];
            const allSame = row.every(symbol => symbol === firstSymbol);
            if (allSame) {
                winnings += bet * SYMBOL_VALUE[firstSymbol]; // Calculate winnings
            }
        }
    }
    return winnings;
};

// API Endpoints

// Deposit route
app.post("/deposit", (req, res) => {
    const { amount } = req.body;
    try {
        const newBalance = deposit(amount);
        res.status(200).json({ balance: newBalance });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Spin route
app.post("/spin", (req, res) => {
    const { bet, lines } = req.body; // Get bet and lines from request
    if (balance < bet) {
        return res.status(400).json({ error: "Insufficient balance" });
    }

    const reels = spin(lines); // Get the reels
    const rows = reels[0].map((_, index) => reels.map(reel => reel[index])); // Convert reels to rows
    const winnings = calculateWinnings(rows, bet, lines); // Calculate winnings based on rows
    balance += winnings - bet; // Deduct bet, then add winnings

    res.status(200).json({ reels, winnings, balance });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
