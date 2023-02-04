import { Loading } from '@nextui-org/react';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import type { FC} from 'react';
import { useEffect, useState } from 'react';

const Settings: FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Update session
  useEffect(() => {
    // TODO: this is a bit of a hack, make it less so?
    getSession().then(setSession).then(() => void setIsLoading(false)).catch(setError);
  }, []);

  if (error) return (<div>{error}</div>);
  if (isLoading) return (<Loading />);
  return (<pre>{JSON.stringify(session, null, 2)}</pre>);
};

export default Settings;
