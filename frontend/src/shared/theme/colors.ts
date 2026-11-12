import tokens from './tokens.json';

export const colors = tokens.colors;

export type ColorToken = keyof typeof colors;
