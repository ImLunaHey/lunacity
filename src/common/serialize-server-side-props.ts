import superjson from 'superjson';

export const serializeServerSideProps = <T extends {}>(props: T) => {
    return superjson.serialize(props) as unknown as T;
};
