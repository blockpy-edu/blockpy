/**
 * Type stubs for external runtime globals that are loaded as separate
 * <script> tags in the HTML page and are therefore not imported as modules.
 *
 * These declarations prevent TypeScript from complaining about unresolved
 * identifiers while keeping the types permissive during the initial migration.
 * Replace `any` with proper type definitions as the migration matures.
 */

/** Skulpt – client-side Python interpreter */
declare var Sk: any;

/** Blockly – visual block editor */
declare var Blockly: any;

/** jQuery (also available via the webpack ProvidePlugin) */
declare var $: any;
declare var jQuery: any;
