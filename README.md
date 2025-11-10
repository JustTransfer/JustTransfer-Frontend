# GoGoTransfer Frontend

This is the frontend application for GoGoTransfer, a file transfer service. The frontend is built using React and TypeScript, and it interacts with a backend server to facilitate file uploads and downloads.

## Features
- TODO

## Setup
To set up the project locally, follow these steps:

```bash
npm run start
```

## TODO
- Validate password strength
- Support large files (not in memory)
- Support drag and drop
- Make account page (key rotation, delete account, etc.)
- Make anonymous transfer page (create transfer and receive transfer)
- Use TLD for the signatures (not just concatenate)
- Validate public key retrieved from the server (Authenticated Data in AEAD)
- OPAQUE
  - Check server public key (maybe not needed if authenticity of the server is checked with TLS)
- Add a anti-virus scanner at the end of the download ?
  - To prenvent malicous files
  - To prevent illegal files sharing
  - Make it with a report button? -> send the file for analysis and delete it?
