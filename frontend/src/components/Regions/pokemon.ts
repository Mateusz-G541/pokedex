export interface Ability {
  ability: {
    name: string;
  };
}

export interface Type {
  type: {
    name: string;
  };
}

export interface Stat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  abilities: Ability[];
  types: Type[];
  stats: Stat[];
  species: {
    url: string;
  };
}
