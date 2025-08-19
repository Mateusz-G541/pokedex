import { Request, Response } from 'express';
import { PokemonService, HttpError } from '../services/pokemon.service';

export class PokemonController {
  private pokemonService: PokemonService;

  constructor() {
    this.pokemonService = new PokemonService();
  }

  async getPokemonByTypeAndRegion(req: Request, res: Response): Promise<void> {
    try {
      const { type, region } = req.query;
      if (!type || !region) {
        res.status(400).json({ error: 'Type and region parameters are required' });
        return;
      }

      const pokemon = await this.pokemonService.getPokemonByTypeAndRegion(
        type as string,
        region as string,
      );
      res.json(pokemon);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch Pokemon' });
    }
  }

  async getPokemonByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const pokemon = await this.pokemonService.getPokemonByName(name);
      res.json(pokemon);
    } catch (error) {
      // Quiet 404s (expected in tests), log others
      if (error instanceof HttpError && error.status === 404) {
        res.status(404).json({
          error: 'Pokemon not found',
          details: error.message,
        });
        return;
      }
      console.error('Error fetching Pokemon:', error);
      res.status(500).json({ error: 'Failed to fetch Pokemon' });
    }
  }

  // Debug endpoint to check API configuration
  async getDebugInfo(req: Request, res: Response): Promise<void> {
    try {
      const debugInfo = {
        customApiUrl: 'http://srv36.mikr.us:20275/api/v2',
        nodeEnv: process.env.NODE_ENV || 'Not set',
        timestamp: new Date().toISOString(),
      };
      res.json(debugInfo);
    } catch (error) {
      res.status(500).json({ error: 'Debug info failed' });
    }
  }

  async getPokemonEvolution(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const evolution = await this.pokemonService.getPokemonEvolution(name);
      res.json(evolution);
    } catch (error) {
      res.status(404).json({ error: 'Evolution chain not found' });
    }
  }

  async comparePokemon(req: Request, res: Response): Promise<void> {
    try {
      const { first, second } = req.query;
      if (!first || !second) {
        res.status(400).json({ error: 'Both Pokemon names are required' });
        return;
      }

      const comparison = await this.pokemonService.comparePokemon(
        first as string,
        second as string,
      );
      res.json(comparison);
    } catch (error) {
      res.status(404).json({ error: 'Failed to compare Pokemon' });
    }
  }

  async getAllTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await this.pokemonService.getAllTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch Pokemon types' });
    }
  }

  async getRegions(req: Request, res: Response): Promise<void> {
    try {
      const regions = this.pokemonService.getRegions();
      res.json(regions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch regions' });
    }
  }

  async getRandomLegendaryPokemon(req: Request, res: Response): Promise<void> {
    try {
      const pokemon = await this.pokemonService.getRandomLegendaryPokemon();
      res.json(pokemon);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch random legendary Pokemon' });
    }
  }

  async getPokemonSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      console.log('Received suggestion request with query:', query);

      if (!query) {
        console.log('No query parameter provided');
        res.status(400).json({ error: 'Query parameter is required' });
        return;
      }

      const suggestions = await this.pokemonService.getPokemonSuggestions(query as string);
      console.log('Sending suggestions:', suggestions);
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch Pokemon suggestions' });
    }
  }
}
