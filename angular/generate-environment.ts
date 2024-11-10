const fs = require('fs');
const serverUrl = process.env['REACT_APP_LOCAL_RELAY_SERVER_URL'];
const environmentFileContent = `
export const environment = {
   production: true,
   relayServerUrl: 'wss://${serverUrl}',
   serverUrl: '${serverUrl}:8081',
};
`;
fs.writeFileSync('./src/environment.ts', environmentFileContent);