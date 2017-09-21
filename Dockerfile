FROM ubuntu:16.04

ENV NVM_DIR /usr/local/nvm
ENV APP_DIR /wazowski

RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean \
    && curl -sL https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 > /usr/local/bin/dumb-init \
    && chmod +x /usr/local/bin/dumb-init \
    && curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.4/install.sh | bash

ADD . $APP_DIR

RUN . $NVM_DIR/nvm.sh \
    && cd $APP_DIR \
    && nvm install \
    && nvm use \
    && npm install

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["$APP_DIR/bootstrap"]
