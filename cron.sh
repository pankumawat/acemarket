cd /home/opc/node/qlink
if [ `git pull | grep -ic 'Already up-to-date'` -eq 1 ];
then
  sh run.sh
fi
