import axios from 'axios';

const BuildClient = ({ req }) => {
    if ( typeof window === 'undefined' ) {
        // we are on the server
        return axios.create({
            //baseURL: 'http://ticketing.dev',
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });
    } else {
        return axios.create({
            baseUrl: '/'
        });
    }
};

export default BuildClient;