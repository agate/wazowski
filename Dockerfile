FROM agate/wazowski:base-node82

ENV APP_DIR /wazowski

ADD . $APP_DIR
ADD bootstrap /usr/local/bin

RUN . $NVM_DIR/nvm.sh \
    && cd $APP_DIR \
    && nvm install \
    && nvm use \
    && npm install

CMD ["bootstrap"]
