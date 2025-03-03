# Updated main.py with training/test split
import logging
import torch
import torch.nn as nn
import torch.optim as optim
import yfinance as yf
import pandas as pd
from fastapi import FastAPI
from datetime import datetime
from pydantic import BaseModel
import os
import numpy as np

app = FastAPI()

class TradingEnvironment:
    def __init__(self, data, symbol):
        self.data = data
        self.initial_balance = 10000
        self.balance = self.initial_balance
        self.holdings = 0
        self.index = 0
        self.symbol = symbol

    def reset(self):
        self.balance = self.initial_balance
        self.holdings = 0
        self.index = 0
        return self.get_state()

    def step(self, action):
        price = float(self.data.loc[self.index, f'Close_{self.symbol}'])
        if action == 1 and self.balance >= price:
            self.holdings = self.balance // price
            self.balance -= self.holdings * price
        elif action == 2 and self.holdings > 0:
            self.balance += self.holdings * price
            self.holdings = 0
        self.index += 1
        done = self.index >= len(self.data) - 1
        return (self.get_state() if not done else None), self.balance - self.initial_balance, done, {}

    def get_state(self):
        return np.array([
            self.data.iloc[self.index][f'Open_{self.symbol}'],
            self.data.iloc[self.index][f'High_{self.symbol}'],
            self.data.iloc[self.index][f'Low_{self.symbol}'],
            self.data.iloc[self.index][f'Close_{self.symbol}']
        ], dtype=np.float32)

class DQN(nn.Module):
    def __init__(self, state_size, action_size):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(state_size, 64)
        self.fc2 = nn.Linear(64, 64)
        self.fc3 = nn.Linear(64, action_size)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

class TrainModelRequest(BaseModel):
    symbol: str
    start_date: str
    end_date: str

@app.post("/train_model")
async def train_model(request: TrainModelRequest):
    data = yf.download(request.symbol, start=request.start_date, end=request.end_date)
    data.reset_index(inplace=True)
    train_size = int(0.8 * len(data))
    train_data, test_data = data.iloc[:train_size], data.iloc[train_size:]
    
    env = TradingEnvironment(train_data, request.symbol)
    agent = DQN(4, 3)
    optimizer = optim.Adam(agent.parameters(), lr=0.001)
    criterion = nn.MSELoss()
    
    state = env.reset()
    done = False
    while not done:
        action = torch.argmax(agent(torch.FloatTensor(state).unsqueeze(0))).item()
        next_state, reward, done, _ = env.step(action)
        state = next_state if next_state is not None else state
    
    torch.save(agent.state_dict(), "dqn_model.pth")
    return {"message": "Model training complete"}
