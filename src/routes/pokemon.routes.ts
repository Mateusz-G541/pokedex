import { Router } from 'express';
import { PokemonController } from '../controllers/pokemon.controller';

const router = Router();
const pokemonController = new PokemonController();

// Debug endpoint to check API configuration
router.get('/debug', pokemonController.getDebugInfo.bind(pokemonController));

// Get all Pokemon types
router.get('/pokemon/types', pokemonController.getAllTypes.bind(pokemonController));

// Get all regions
router.get('/pokemon/regions', pokemonController.getRegions.bind(pokemonController));

// Compare two Pokemon
router.get('/pokemon/compare', pokemonController.comparePokemon.bind(pokemonController));

// Get Pokemon by type and region
router.get('/pokemon', pokemonController.getPokemonByTypeAndRegion.bind(pokemonController));

// Get random legendary Pokemon
router.get(
  '/pokemon/random/legendary',
  pokemonController.getRandomLegendaryPokemon.bind(pokemonController),
);

// Get Pokemon suggestions
router.get('/pokemon/suggestions', pokemonController.getPokemonSuggestions.bind(pokemonController));

// Get Pokemon evolution chain
router.get(
  '/pokemon/:name/evolution',
  pokemonController.getPokemonEvolution.bind(pokemonController),
);

// Get Pokemon by name
router.get('/pokemon/:name', pokemonController.getPokemonByName.bind(pokemonController));

export default router;
