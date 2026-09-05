import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

interface JsonSchema {
  type?: string;
  [key: string]: unknown;
}

interface ItemIdentity {
  value: unknown;
  hasName: boolean;
}

function getProperty(value: unknown, property: string): unknown {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  return (value as Record<string, unknown>)[property];
}

function getItemIdentity(item: unknown, includeTitle: boolean): ItemIdentity {
  const name = getProperty(item, 'name');
  if (name) {
    return { value: name, hasName: true };
  }

  if (includeTitle) {
    const title = getProperty(item, 'title');
    if (title) {
      return { value: title, hasName: false };
    }
  }

  return { value: 'Unknown', hasName: false };
}

function formatValue(value: unknown): string {
  return typeof value === 'string' ? value : String(value);
}

function getConstructorName(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const constructor = (value as { constructor?: unknown }).constructor;
  if (constructor === null || constructor === undefined) {
    return undefined;
  }

  const name = (constructor as { name?: unknown }).name;
  return typeof name === 'string' ? name : undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;
    return typeof message === 'string' ? message : String(message);
  }

  return String(error);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get schema path from CLI args or auto-detect based on --type flag
const args = process.argv.slice(2);
const schemaArgIndex = args.indexOf('--schema');
const typeArgIndex = args.indexOf('--type');

let schemaPath: string;
let dataType: string | undefined;

if (schemaArgIndex !== -1 && args[schemaArgIndex + 1]) {
  // Explicit --schema provided
  schemaPath = join(__dirname, '..', args[schemaArgIndex + 1]);
} else if (typeArgIndex !== -1 && args[typeArgIndex + 1]) {
  // Auto-detect schema based on --type flag
  dataType = args[typeArgIndex + 1];
  const typeToSchema: Record<string, string> = {
    spells: 'src/data/schemas/spell.schema.json',
    subclasses: 'src/data/schemas/subclass.schema.json',
    feats: 'src/data/schemas/feat.schema.json',
    backgrounds: 'src/data/schemas/background.schema.json',
    species: 'src/data/schemas/species.schema.json',
    classes: 'src/data/schemas/class.schema.json'
  };
  
  if (!typeToSchema[dataType]) {
    console.error(`❌ Unknown type: ${dataType}. Valid types: spells, subclasses, feats, backgrounds, species, classes`);
    process.exit(1);
  }
  
  schemaPath = join(__dirname, '..', typeToSchema[dataType]);
} else {
  // Default to spells for backward compatibility
  dataType = 'spells';
  schemaPath = join(__dirname, '..', 'src', 'data', 'schemas', 'spell.schema.json');
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8')) as JsonSchema;

// Initialize Ajv validator
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile<unknown>(schema);

/**
 * Validate data against JSON Schema (generic function)
 */
export function validateData(data: unknown[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: { total: number };
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenNames = new Set<unknown>();
  
  // For array schemas (like species), validate the entire array at once
  const isArraySchema = schema.type === 'array';
  
  if (isArraySchema) {
    // Validate the whole array against the schema
    const isValid = validate(data);
    if (!isValid) {
      for (const error of validate.errors || []) {
        const field = error.instancePath ? error.instancePath.slice(1) : 'root';
        errors.push(`Invalid ${field} - ${error.message}`);
      }
    }
    
    // Check for duplicate names manually
    const duplicateNameLabel = dataType === 'classes' ? 'class' : 'species';
    for (const item of data) {
      const name = getItemIdentity(item, false).value;
      if (seenNames.has(name)) {
        errors.push(`Duplicate ${duplicateNameLabel} name: ${formatValue(name)}`);
      }
      seenNames.add(name);
    }
  } else {
    // Validate each item individually (for non-array schemas)
    const itemType = getConstructorName(data[0]) || 'Item';
    for (const [index, item] of data.entries()) {
      const identity = getItemIdentity(item, true);
      const prefix = `${itemType} #${index + 1} (${formatValue(identity.value)})`;
      
      // Check for duplicates
      if (seenNames.has(identity.value)) {
        errors.push(`${prefix}: Duplicate ${identity.hasName ? 'name' : 'title'}`);
        continue;
      }
      seenNames.add(identity.value);
      
      // Validate against schema
      const isValid = validate(item);
      if (!isValid) {
        for (const error of validate.errors || []) {
          const field = error.instancePath ? error.instancePath.slice(1) : 'root';
          errors.push(`${prefix}: Invalid ${field} - ${error.message}`);
        }
        continue;
      }
    }
  }
  
  const stats = {
    total: data.length
  };
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats
  };
}

/**
 * Main validation function - called from CLI
 */
export async function main(): Promise<void> {
  // Determine data type and file path based on auto-detected type or schema name
  const schemaName = schemaPath.split('/').pop() || 'spell.schema.json';
  
  if (!dataType) {
    // Auto-detect from schema filename
    if (schemaName.includes('spell')) {
      dataType = 'spells';
    } else if (schemaName.includes('subclass')) {
      dataType = 'subclasses';
    } else if (schemaName.includes('feat')) {
      dataType = 'feats';
    } else if (schemaName.includes('background')) {
      dataType = 'backgrounds';
    } else if (schemaName.includes('species')) {
      dataType = 'species';
    } else if (schemaName.includes('class')) {
      dataType = 'classes';
    } else {
      console.error(`❌ Unknown schema type: ${schemaName}`);
      process.exit(1);
    }
  }
  
  const dataPathMap: Record<string, string> = {
    spells: join(__dirname, '..', 'src', 'data', 'spells.json'),
    subclasses: join(__dirname, '..', 'src', 'data', 'subclasses.json'),
    feats: join(__dirname, '..', 'src', 'data', 'feats.json'),
    backgrounds: join(__dirname, '..', 'src', 'data', 'backgrounds.json'),
    species: join(__dirname, '..', 'src', 'data', 'species.json'),
    classes: join(__dirname, '..', 'src', 'data', 'classes.json')
  };
  
  const dataPath = dataPathMap[dataType];
  
  console.log(`🔍 Validating ${dataType}.json against JSON Schema...\n`);
  
  let data: unknown[];
  try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const parsedData: unknown = JSON.parse(rawData);

    if (!Array.isArray(parsedData)) {
      throw new Error('Expected array format');
    }

    data = parsedData;
  } catch (error: unknown) {
    console.error(`❌ Failed to parse ${dataType}.json: ${getErrorMessage(error)}`);
    process.exit(1);
  }
  
  console.log(`📊 Found ${data.length} ${dataType}\n`);
  
  // Validate
  const result = validateData(data);
  
  // Print statistics
  if (result.stats.total > 0) {
    console.log('✅ Validation PASSED');
    console.log(`   Total: ${result.stats.total}`);
    console.log(`   Warnings: ${result.warnings.length}`);
  } else {
    console.log('\n⚠️  No items found to validate');
  }
  
  // Print warnings
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    for (const warning of result.warnings) {
      console.log(`   ⚠ ${warning}`);
    }
  }
  
  // Print errors
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    for (const error of result.errors) {
      console.log(`   ❌ ${error}`);
    }
    
    console.log(`\n❌ Validation FAILED with ${result.errors.length} errors`);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1] || '')) {
  main().catch((error) => {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  });
}
