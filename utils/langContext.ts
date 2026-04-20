import { createContext } from 'react';
import { Language, t as translate } from './i18n';

export interface LangContextType {
  lang: Language;
  t: (key: string) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  t: (key) => translate('en', key),
});
