export type GenderOption = 'Female' | 'Male' | 'Non-binary' | 'Prefer not to say';

export interface TravelerProfile {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthdate: string;
  gender: GenderOption;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  type: TravelerType;
}

export type TravelerType = 'Infant' | 'Child' | 'Teen' | 'Adult' | 'Senior';
