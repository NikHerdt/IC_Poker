import React, { useState, useEffect, useContext } from 'react';
import ContentContext from './contentContext';
import useContentful from '../../hooks/useContentful';
import locaContext from '../localization/locaContext';
import config from '../../clientConfig';
import fallbackStrings from '../../fallback-strings.json';

const ContentProvider = ({ children }) => {
  const { lang } = useContext(locaContext);

  const [isLoading, setIsLoading] = useState(true);
  const [staticPages, setStaticPages] = useState(null);
  const [localizedStrings, setLocalizedStrings] = useState(null);

  // Check if Contentful is configured (not using placeholder values)
  const isContentfulConfigured = 
    config.contentfulSpaceId && 
    config.contentfulAccessToken &&
    typeof config.contentfulSpaceId === 'string' &&
    typeof config.contentfulAccessToken === 'string' &&
    !config.contentfulSpaceId.includes('placeholder') &&
    !config.contentfulAccessToken.includes('placeholder');
  
  // Always call the hook (React rules), but we'll check before using it
  const contentfulClient = useContentful();

  const loadFallbackStrings = () => {
    const strings = {};
    Object.keys(fallbackStrings).forEach((key) => {
      strings[key] = fallbackStrings[key][lang] || fallbackStrings[key].en || key;
    });
    console.log('Loaded fallback strings:', Object.keys(strings).length, 'keys');
    setLocalizedStrings(strings);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    setLocalizedStrings(null); // Reset strings

    console.log('ContentProvider: isContentfulConfigured =', isContentfulConfigured);
    console.log('ContentProvider: config values:', {
      spaceId: config.contentfulSpaceId,
      hasToken: !!config.contentfulAccessToken
    });
    
    if (isContentfulConfigured && contentfulClient) {
      fetchContent();
    } else {
      // Use fallback strings when Contentful is not configured
      console.log('ContentProvider: Using fallback strings, lang =', lang);
      loadFallbackStrings();
    }
    // eslint-disable-next-line
  }, [lang]);

  const fetchContent = () => {
    if (!contentfulClient) {
      loadFallbackStrings();
      return;
    }
    
    Promise.all([
      contentfulClient
        .getEntries({ content_type: 'key', locale: lang })
        .then((res) => {
          let localizedStrings = {};

          res.items.forEach(
            (item) =>
              (localizedStrings[item.fields.keyName] =
                item.fields.value.fields.value),
          );

          return localizedStrings;
        })
        .catch((error) => {
          console.warn('Failed to fetch from Contentful, using fallback strings:', error);
          const strings = {};
          Object.keys(fallbackStrings).forEach((key) => {
            strings[key] = fallbackStrings[key][lang] || fallbackStrings[key].en || key;
          });
          return strings;
        }),
      contentfulClient
        .getEntries({ content_type: 'staticPage', locale: lang })
        .then((res) => {
          return res.items.map((item) => ({
            slug: item.fields.slug,
            title: item.fields.title,
            content: item.fields.content.fields.value,
          }));
        })
        .catch((error) => {
          console.warn('Failed to fetch static pages from Contentful:', error);
          return [];
        }),
    ]).then(([localizedStrings, staticPages]) => {
      setLocalizedStrings(localizedStrings);
      setStaticPages(staticPages);
      setIsLoading(false);
    });
  };

  const getLocalizedString = (key) =>
    localizedStrings && localizedStrings[key] ? localizedStrings[key] : key;

  return (
    <ContentContext.Provider
      value={{ isLoading, staticPages, getLocalizedString }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export default ContentProvider;
