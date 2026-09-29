import React from 'react';
import { useTranslation } from 'react-i18next';
import './Loading.css';

const Loading = (props) => {
  const { t } = useTranslation('common');
  const message = props.message ?? t('loading');
  return (
    <div className="container">
      <div className="loader" role="status">
        <span className="sr-only">{message}</span>
      </div>
      {message && <p className="medieval-text">{message}</p>}
    </div>
  );
};

export default Loading;
