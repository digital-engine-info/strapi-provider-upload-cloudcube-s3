"use strict";

const AWS = require("aws-sdk");

const buildPath = (file, cubename) => `${cubename}/public/` + (file.path ? `${file.path}/` : "");

module.exports = {
  init(i_config) {
    const { url, ...config } = i_config;

    const parsed_url = new URL(url);
    const [Bucket] = parsed_url.hostname.split(".", 1);
    const cubename = parsed_url.pathname.slice(1);

    config.params = config.params || {};
    config.params.Bucket = Bucket;

    const S3 = new AWS.S3({
      apiVersion: "2006-03-01",
      ...config,
    });

    const upload = (file, customParams = {}) =>
      new Promise((resolve, reject) => {
        // upload file on S3 bucket
        const path = buildPath(file, cubename);
        S3.upload(
          {
            Key: `${path}${file.hash}${file.ext}`,
            Body: file.stream || Buffer.from(file.buffer, "binary"),
            ACL: "public-read",
            ContentType: file.mime,
            ...customParams,
          },
          (err, data) => {
            if (err) {
              return reject(err);
            }

            // set the bucket file url
            file.url = data.Location;

            resolve();
          }
        );
      });

    return {
      uploadStream(file, customParams = {}) {
        return upload(file, customParams);
      },
      upload(file, customParams = {}) {
        return upload(file, customParams);
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const path = buildPath(file, cubename);
          S3.deleteObject(
            {
              Key: `${path}${file.hash}${file.ext}`,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};
