#export OLD_DEPLOY=ozten-roomr-39a14a1                                                                                                                                                            
export OLD_DEPLOY=`ls -altr | grep 'roomr ->' | cut -d '-' -f 2,3,4,5 | cut -d ' ' -f 2` && \
wget https://github.com/ozten/roomr/tarball/master && \
# export NEW_DEPLOY=ozten-roomr-7e1bfc8                                                                                                                                                          
export NEW_DEPLOY=`tar tfz master | cut -d '/' -f 1 | sort -u` && \
./are_diff "${OLD_DEPLOY}" "${NEW_DEPLOY}" && \
echo "Replacing old deployment ${OLD_DEPLOY} with new deployement ${NEW_DEPLOY}" && \
tar xfz master && \
rm master && \
cd $NEW_DEPLOY && \
cp -Rf ../${OLD_DEPLOY}/node_modules . && \
npm install && \
cp -Rf ../${OLD_DEPLOY}/server/etc/config.js server/etc/ && \
cd .. && \
# sudo svc -d /service/roomr                                                                                                                                                                     
rm roomr && ln -s $NEW_DEPLOY roomr && \
sudo /command/svc -t /service/roomr
