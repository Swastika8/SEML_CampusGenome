import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../../lib/api';

export const ForumContext = createContext(null);
export const useForum = () => useContext(ForumContext);

export function useForumRequest(path, token, revision = 0) {
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!path) return;
    const request = new AbortController();
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(15000)]);
    api(path, { token, signal }).then(
      (result) => {
        if (!request.signal.aborted) setState({ path, token, revision, result, error: '' });
      },
      (error) => {
        if (!request.signal.aborted) setState({ path, token, revision, error: error.message });
      },
    );
    return () => request.abort();
  }, [path, token, revision]);
  if (!path) return { result: null, error: '', loading: false };
  const match = state?.path === path && state?.token === token;
  return {
    result: match ? state.result : null,
    error: match && state.revision === revision ? state.error : '',
    loading: !match || state.revision !== revision,
  };
}

export function communityTone(community) {
  const kinds = {
    Academics: 'purple',
    Career: 'blue',
    Communities: 'green',
    Events: 'pink',
    Lifestyle: 'yellow',
    Discussion: 'orange',
  };
  return kinds[community?.default_category] || 'blue';
}

export const reportReasons = {
  spam: 'Spam',
  harassment: 'Harassment',
  'personal-information': 'Private information',
  misleading: 'Misleading information',
  other: 'Something else',
};
