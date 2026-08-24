/**
 * Sustituto de `@paypal/react-paypal-js/sdk-v6` para Jest.
 *
 * El paquete sólo declara la condición `import` para ese subpath (ESM puro) y
 * Jest resuelve por `require`, así que sin este mapeo la suite entera de la home
 * no arranca: «Cannot find module». Mismo motivo por el que ya se sustituyen
 * `nanoid` y los módulos de `next-intl`.
 *
 * El doble no simula el flujo de pago: renderiza un botón inerte, que es lo que
 * necesitan las pruebas de la página. Si alguna prueba llega a depender del
 * comportamiento real de PayPal, el sitio correcto es un test de integración,
 * no este mock.
 */
const React = require('react');

const PayPalProvider = ({ children }) => React.createElement(React.Fragment, null, children);

const PayPalSubscriptionButton = (props) =>
  React.createElement('button', { type: 'button', 'data-testid': 'paypal-subscription-button', disabled: props?.disabled });

module.exports = {
  PayPalProvider,
  PayPalSubscriptionButton,
  __esModule: true,
};
