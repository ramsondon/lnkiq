import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * OpenAPI specification schema validator
 * Validates the basic structure of an OpenAPI 3.0 document
 */
function validateOpenAPISpec(spec: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof spec !== 'object' || spec === null) {
    errors.push('Spec must be an object');
    return { valid: false, errors };
  }

  const doc = spec as Record<string, unknown>;

  // Check required top-level fields
  if (typeof doc.openapi !== 'string') {
    errors.push('Missing or invalid "openapi" version field');
  } else if (!doc.openapi.startsWith('3.')) {
    errors.push(`OpenAPI version "${doc.openapi}" is not supported, expected 3.x`);
  }

  if (typeof doc.info !== 'object' || doc.info === null) {
    errors.push('Missing or invalid "info" object');
  } else {
    const info = doc.info as Record<string, unknown>;
    if (typeof info.title !== 'string') {
      errors.push('Missing or invalid "info.title"');
    }
    if (typeof info.version !== 'string') {
      errors.push('Missing or invalid "info.version"');
    }
  }

  if (typeof doc.paths !== 'object' || doc.paths === null) {
    errors.push('Missing or invalid "paths" object');
  } else {
    const paths = doc.paths as Record<string, unknown>;
    for (const [pathKey, pathItem] of Object.entries(paths)) {
      if (!pathKey.startsWith('/')) {
        errors.push(`Path "${pathKey}" must start with /`);
      }
      if (typeof pathItem !== 'object' || pathItem === null) {
        errors.push(`Path "${pathKey}" must be an object`);
        continue;
      }

      const operations = pathItem as Record<string, unknown>;
      const validMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'];

      for (const [method, operation] of Object.entries(operations)) {
        if (method === 'parameters' || method === '$ref') continue;

        if (!validMethods.includes(method)) {
          errors.push(`Invalid HTTP method "${method}" in path "${pathKey}"`);
          continue;
        }

        if (typeof operation !== 'object' || operation === null) {
          errors.push(`Operation ${method.toUpperCase()} ${pathKey} must be an object`);
          continue;
        }

        const op = operation as Record<string, unknown>;
        if (typeof op.responses !== 'object' || op.responses === null) {
          errors.push(`Operation ${method.toUpperCase()} ${pathKey} missing "responses"`);
        }
      }
    }
  }

  // Validate components if present
  if (doc.components !== undefined) {
    if (typeof doc.components !== 'object' || doc.components === null) {
      errors.push('"components" must be an object');
    } else {
      const components = doc.components as Record<string, unknown>;

      // Validate schemas
      if (components.schemas !== undefined) {
        if (typeof components.schemas !== 'object' || components.schemas === null) {
          errors.push('"components.schemas" must be an object');
        } else {
          const schemas = components.schemas as Record<string, unknown>;
          for (const [schemaName, schema] of Object.entries(schemas)) {
            if (typeof schema !== 'object' || schema === null) {
              errors.push(`Schema "${schemaName}" must be an object`);
            }
          }
        }
      }

      // Validate securitySchemes
      if (components.securitySchemes !== undefined) {
        if (typeof components.securitySchemes !== 'object' || components.securitySchemes === null) {
          errors.push('"components.securitySchemes" must be an object');
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * GET /api/v1/openapi
 * Returns the OpenAPI specification for the lnkiq API
 */
export async function GET(request: NextRequest) {
  try {
    // Read the static api.json file from the public directory
    const filePath = path.join(process.cwd(), 'public', 'api.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');

    let spec: unknown;
    try {
      spec = JSON.parse(fileContent);
    } catch (parseError) {
      // Log JSON parse error silently
      console.error('[OpenAPI] Failed to parse api.json:', parseError);
      return NextResponse.json(
        { error: 'OpenAPI specification is malformed' },
        { status: 500 }
      );
    }

    // Validate the OpenAPI spec structure
    const validation = validateOpenAPISpec(spec);
    if (!validation.valid) {
      // Log validation errors silently - don't expose to client
      console.error('[OpenAPI] Schema validation errors:', validation.errors);
    }

    // Return the spec with proper headers
    return new NextResponse(JSON.stringify(spec, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    // Log file read error silently
    console.error('[OpenAPI] Failed to read api.json:', error);
    return NextResponse.json(
      { error: 'OpenAPI specification not found' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/v1/openapi
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
