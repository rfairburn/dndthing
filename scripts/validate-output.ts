import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

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
    'spell-progression': 'src/data/schemas/spell-progression.schema.json',
    classes: 'src/data/schemas/class.schema.json'
  };
  
  if (!typeToSchema[dataType]) {
    console.error(`❌ Unknown type: ${dataType}. Valid types: spells, subclasses, feats, backgrounds`);
    process.exit(1);
  }
  
  schemaPath = join(__dirname, '..', typeToSchema[dataType]);
} else {
  // Default to spells for backward compatibility
  dataType = 'spells';
  schemaPath = join(__dirname, '..', 'src', 'data', 'schemas', 'spell.schema.json');
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

// Initialize Ajv validator
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile<any>(schema);

/**
 * Validate data against JSON Schema (generic function)
 */
export function validateData(data: any, isObjectFormat = false): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: { total: number };
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenNames = new Set<string>();
  
  // For object format (spell-progression), validate the object directly
  if (isObjectFormat) {
    const isValid = validate(data);
    if (!isValid) {
      for (const error of validate.errors || []) {
        const field = error.instancePath ? error.instancePath.slice(1) : 'root';
        errors.push(`Invalid ${field} - ${error.message}`);
      }
    }
  } else {
    // For array schemas, validate the entire array at once
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
      for (const item of data) {
        const name = item.name || 'Unknown';
        if (seenNames.has(name)) {
          errors.push(`Duplicate class name: ${name}`);
        }
        seenNames.add(name);
      }
    } else {
      // Validate each item individually (for non-array schemas)
      for (const [index, item] of data.entries()) {
        const name = item.name || item.title || 'Unknown';
        const prefix = `${data[0].constructor?.name || 'Item'} #${index + 1} (${name})`;
        
        // Check for duplicates
        if (seenNames.has(name)) {
          errors.push(`${prefix}: Duplicate ${item.name ? 'name' : 'title'}`);
          continue;
        }
        seenNames.add(name);
        
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
  }
  
  const stats = {
    total: isObjectFormat ? 1 : data.length
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
    if (schemaName.includes('spell') && !schemaName.includes('progression')) {
      dataType = 'spells';
    } else if (schemaName.includes('subclass')) {
      dataType = 'subclasses';
    } else if (schemaName.includes('feat')) {
      dataType = 'feats';
    } else if (schemaName.includes('background')) {
      dataType = 'backgrounds';
    } else if (schemaName.includes('species')) {
      dataType = 'species';
    } else if (schemaName.includes('spell-progression')) {
      dataType = 'spell-progression';
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
    'spell-progression': join(__dirname, '..', 'src', 'data', 'spell-progression.json'),
    classes: join(__dirname, '..', 'src', 'data', 'classes.json')
  };
  
  const dataPath = dataPathMap[dataType];
  
  console.log(`🔍 Validating ${dataType}.json against JSON Schema...\n`);
  
  let data: any;
  try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    data = JSON.parse(rawData);
    
    // spell-progression is now an object, not an array
    const isObjectFormat = dataType === 'spell-progression';
    
    if (!isObjectFormat && !Array.isArray(data)) {
      throw new Error('Expected array format');
    }
    
    if (isObjectFormat && typeof data !== 'object') {
      throw new Error('Expected object format');
    }
  } catch (error: any) {
    console.error(`❌ Failed to parse ${dataType}.json: ${error.message}`);
    process.exit(1);
  }
  
  const itemCount = Array.isArray(data) ? data.length : Object.keys(data).length;
  const displayCount = Array.isArray(data) ? data.length : Object.keys(data).filter(k => k !== 'unifiedSpellSlots').length;
  const suffix = dataType === 'spell-progression' ? ' (+ unifiedSpellSlots)' : '';
  if (dataType === 'spell-progression') {
    console.log(`📊 Found ${displayCount} spell-progressio(s)${suffix}\n`);
  } else {
    const itemType = dataType === 'classes' ? 'class' : dataType.slice(0, -1);
    console.log(`📊 Found ${displayCount} ${itemType}(s)${suffix}\n`);
  }
  
   // Validate
   // For object format (spell-progression), validate the object directly
   // For array format, validate the array
   const isObjectFormat = dataType === 'spell-progression';
   const validationResult = isObjectFormat ? data : (Array.isArray(data) ? data : [data]);
   const result = validateData(validationResult, isObjectFormat);
  
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
