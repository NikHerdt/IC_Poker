import { createClient } from 'contentful';
import config from '../clientConfig';

const useContentful = () => {
  // Only create client if credentials are valid
  if (!config.contentfulSpaceId || !config.contentfulAccessToken) {
    return null;
  }
  
  const client = createClient({
    space: config.contentfulSpaceId,
    accessToken: config.contentfulAccessToken,
  });
  return client;
};

export default useContentful;
