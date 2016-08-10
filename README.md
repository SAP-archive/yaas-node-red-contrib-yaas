node-red-contrib-yaas
=====================

<a href="http://nodered.org" target="_new">Node-RED</a> nodes for YaaS (SAP Hybris as a Service).

Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install node-red-contrib-yaas

Overview
--------

Uses the yaas.js[1] npm module to orchestrate various YaaS microservices graphically using Node-RED.

These Node-RED nodes simplify the access to the SAP Hybris as a Service (YaaS) REST APIs. It handles authentication via OAuth2 client credentials, replacement of expired tokens as well as automated retry of failed requests due to expired tokens. Knowledge of endpoint URLs by the developer is not required as all actions have their own functions. Currently only API calls that were needed for Hybris Labs prototypes are implemented. Contributions and pull requests are welcome.

For developers who are interested in trying out the YaaS platform but do not want to study the API documentation in too much detail, the YaaS Node-RED nodes will provide an easy way of exploring the offered YaaS interfaces. 

Third-party YaaS developers will be able to examine our source code for the YaaS Node-RED nodes and will be able to provide their own nodes for the services that they are offering on the YaaS marketplace.

  [1]: https://www.npmjs.com/package/yaas.js 

Requirements
------------

* Node-RED latest version
* Node.js 4.x and later, supporting ECMAScript 6 features like Promises
* A YaaS account: https://www.yaas.io/
* A configured YaaS project and application, for required OAuth2 credentials

Documentation and examples
--------------------------

Blog posts:
* [How to use YaaS with Node-RED](https://labs.hybris.com/2016/08/08/use-yaas-with-node-red/)
* [Triggering and checkout with Node-RED and YaaS](http://labs.hybris.com/2016/08/09/triggering-checkout-node-red-yaas/)

How to contact us
-----------------

* Please email labs@hybris.com if you have questions or suggestions.
