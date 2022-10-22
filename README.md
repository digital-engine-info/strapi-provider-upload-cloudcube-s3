# strapi-provider-upload-cloudcube-s3

This package is strongly inspired from the [official upload S3 provider from Strapi](https://www.npmjs.com/package/strapi-provider-upload-aws-s3)

## Resources

- [LICENSE](LICENSE)

## Installation

```bash
# using yarn
yarn add strapi-provider-upload-cloudcube-s3

# using npm
npm install strapi-provider-upload-cloudcube-s3 --save
```

## Configurations

Your configuration is passed down to the provider. (e.g: `new AWS.S3(config)`). You can see the complete list of options [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property)

See the [using a provider](https://docs.strapi.io/developer-docs/latest/plugins/upload.html#using-a-provider) documentation for information on installing and using a provider. And see the [environment variables](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html#environment-variables) for setting and using environment variables in your configs.

### Provider Configuration

`./config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: "strapi-provider-upload-cloudcube-s3",
      providerOptions: {
        accessKeyId: env("CLOUDCUBE_ACCESS_KEY_ID"), // AWS S3 Access Key
        secretAccessKey: env("CLOUDCUBE_SECRET_ACCESS_KEY"), // AWS S3 Secret Key
        url: env("CLOUDCUBE_URL"), // AWS S3 Cloudcube URL - expected syntax : `https://${bucket}.s3.amazonaws.com/${cubename}`
      },
    },
  },
  // ...
});
```

### Security Middleware Configuration

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `strapi::security` string with the object bellow instead as explained in the [middleware configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.js`

```js
const getBucketHostname = require("strapi-provider-upload-cloudcube-s3").getBucketHostname;
const cloudcubeBucketHostname = getBucketHostname(process.env.CLOUDCUBE_URL);

module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives:{
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", "data:", "blob:", cloudcubeBucketHostname],
          'media-src': ["'self'", "data:", "blob:", cloudcubeBucketHostname],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
```
