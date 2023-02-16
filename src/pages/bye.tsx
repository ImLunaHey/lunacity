import { type FC } from 'react';

const Bye: FC = () => (
  <div>
    <h1>Account Deactivated</h1>
    <p>Your account has been deactivated.</p>
    <p>
      In 30 days your account will be deleted. If you would like to reactivate your account before that happens, just
      signin again.
    </p>
  </div>
);

export default Bye;
