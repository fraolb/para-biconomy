# Para & Biconomy Example Project

This project demonstrates how to integrate **Para** for seamless user authentication using social accounts or wallets and **Biconomy** to enable gasless transactions. Users can log in via Para and send transactions without needing to pay for gas fees directly.

## Features

- **Login with Social Accounts or Wallets**: Users can sign in using Google, Twitter, or an Ethereum wallet.
- **Gasless Transactions**: Transactions are processed through Biconomy's paymaster service, allowing users to interact with the blockchain without holding native tokens for gas fees.
- **Smart Account Abstraction**: The project utilizes smart contract wallets through Para, simplifying the Web3 experience for users.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fraolb/para-biconomy
   ```
2. Navigate to the project folder:
   ```bash
   cd para-biconomy
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory and add the necessary environment variables:

> **Disclaimer:** The URLs and other sensitive links included in this repository are for **testing purposes only**. Do not use them in a production environment without proper security measures.

### Running the Project

Start the development server:

```bash
npm run dev
```

### Usage

1. Open the application in your browser.
2. Click **Login with Para** to authenticate using a social account or wallet.
3. Enter the recipient's address and amount to send.
4. Click **Send Transaction** to initiate a gasless transaction.

## Tech Stack

- **Next.js** - Frontend framework
- **Para** - Authentication & Smart Wallet Management
- **Biconomy** - Gasless transaction infrastructure
- **Ethers.js** - Blockchain interactions

## Disclaimer

This project is an **example implementation** and should not be used in production without proper security measures. The included URLs, API keys, and other sensitive links are provided **for test purposes only**. Always replace them with your own credentials when deploying.

## License

This project is licensed under the MIT License.

---

### Contributions & Feedback

Feel free to contribute or provide feedback! Open an issue or submit a pull request if you find a bug or have improvements.
