export interface Coach {
    id: string;
    name: string;
    jumin: string;
}

export interface YearData {
    [coachId: string]: number[]; // Array of 12 months amounts
}

export interface RosterData {
    [yearMonthKey: string]: string[]; // Array of coach IDs
}

export interface PayrollDB {
    coaches: Coach[];
    years: { [year: string]: YearData };
    rosters: RosterData;
}

export enum ContractType {
    FREELANCER = 'freelancer',
    LABOR = 'labor'
}
