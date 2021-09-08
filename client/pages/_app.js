import buildClient from "../api/build-client";
import 'bootstrap/dist/css/bootstrap.css';
import HeaderComponent from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <HeaderComponent currentUser={currentUser} />
            <div className="container">
                <Component currentUser={currentUser} {...pageProps}  />
            </div>
        </div>
    );
};

AppComponent.getInitialProps = async (context) => {
    const client = buildClient(context.ctx);
    const { data } = await client.get('/api/users/currentuser');
    let pageProps = {};

    if ( context.Component.getInitialProps ) {
        pageProps = await context.Component.getInitialProps(context.ctx, client, data.currentUser);
    }

    return {
        pageProps,
        ...data
    };
};

export default AppComponent;