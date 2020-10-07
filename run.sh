#rm -rf ./node_modules/
npm install;
echo "Deploying changes.."
sudo kill -9 `pgrep node | head -1`
sudo PORT=80 SQL_PORT=1811 npm start &