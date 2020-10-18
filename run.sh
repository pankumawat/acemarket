#rm -rf ./node_modules/
git pull;
npm install;
echo "Deploying changes.."
sudo kill -9 `pgrep node | head -1`
if [[ $1 == local ]]
  then npm run local
  else npn run start &
fi