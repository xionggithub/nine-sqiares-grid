import { create } from 'zustand';

export interface IDatasourceConfigType {
  tableId: string;
  theme: 'light' | 'dark' | 'primary';
  rowRange: string;
  personnel: string;
  allFields: string[];
  horizontalField: string;
  horizontalLeftCategories: string[];
  horizontalMiddleCategories: string[];
  horizontalRightCategories: string[];
  verticalField: string;
  verticalUpCategories: string[];
  verticalMiddleCategories: string[];
  verticalDownCategories: string[];
  group: string;
}

interface IDatasourceConfigStore {
  datasourceConfig: IDatasourceConfigType;
  updateDatasourceConfig: (typeConfig: IDatasourceConfigStore) => void;
}

export const useDatasourceConfigStore = create<IDatasourceConfigStore>((set) => ({
  datasourceConfig: {
    tableId: '',
    theme: 'light',
    rowRange: '',
    personnel: '',
    allFields: [],
    horizontalField: '',
    horizontalLeftCategories: [],
    horizontalMiddleCategories: [],
    horizontalRightCategories: [],
    verticalField: '',
    verticalUpCategories: [],
    verticalMiddleCategories: [],
    verticalDownCategories: [],
    group: ''
  },
  updateDatasourceConfig: (datasourceConfig) => set(() => ({ datasourceConfig })),
}));

export interface ITextConfigType {
  HLeftValue: string,
  HMiddleValue: string,
  HRightValue: string,
  VupValue: string,
  VMiddleValue: string,
  VDownValue: string,
  leftDownValue: string,
  middleDownValue: string,
  rightDownValue: string,
  leftMiddleValue: string,
  middleMiddleValue: string,
  rightMiddleValue: string,
  leftUpValue: string,
  middleUpValue: string,
  rightUpValue: string,
}

interface ITextConfigStore {
  textConfig: ITextConfigType;
  updateTextConfig: (styleConfig: ITextConfigType) => void;
}

export const useTextConfigStore = create<ITextConfigStore>((set) => ({
  textConfig: {
    HLeftValue: '',
    HMiddleValue: '',
    HRightValue: '',
    VupValue: '',
    VMiddleValue: '',
    VDownValue: '',
    leftDownValue: '',
    middleDownValue: '',
    rightDownValue: '',
    leftMiddleValue: '',
    middleMiddleValue: '',
    rightMiddleValue: '',
    leftUpValue: '',
    middleUpValue: '',
    rightUpValue: '',
  },
  updateTextConfig: (textConfig: ITextConfigType) =>
    set(() => ({ textConfig })),
}));
