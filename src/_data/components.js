const slugify = require('slugify');
const requireGlob = require('require-glob');
const path = require('path');

function convertComponent(component) {
  // Extract variants from component and remove them
  let { variants = [] } = component;
  delete component.variants;

  // Back out if the component isn't valid
  if (!component || !component.title) return null;

  // Set sensible defaults for previews & slugs
  component.preview = component.preview || 'default';
  const parentSlug = component.slug || slugify(component.title.toLowerCase());
  
  // Loop the variants, returning a merged combo of component, then variant
  variants = variants.map(variant => {
    const variantSlug = slugify(variant.title.toLowerCase());
    const preview = !!variant.preview ? variant.preview || 'default' : component.preview || 'default';

    return {
      ...component,
      ...variant,
      context: {
        ...component.context,
        ...variant.context
      },
      variant: true,
      preview,
      originalTitle: variant.title,
      title: `${component.title} - ${variant.title}`,
      slug: `${parentSlug}-${variantSlug}`
    }
  });
    
  // Return the main component and any variants
  return [
    {
      slug: parentSlug,
      ...component,
    },
    ...variants
  ]
}

function reducer(options, tree, fileObj) {
  if (!fileObj) return tree;
  if (tree.components === undefined) tree.components = [];
  let componentPath = path.parse(fileObj.path);
  tree.components.push({
    ...fileObj.exports,
    name: componentPath.name.split('.')[0]
  });
  return tree;
}

function prepareMenu(groups) {
  const menu = groups.map(group => {
    const [parent, ...variants] = group
    return {
      title: parent.title,
      url: `/components/${parent.slug}/`,
      children: variants?.map(({ title, slug }) => ({ title, url: `/components/${slug}/` })) || []
    }
  });

  menu.sort((a, b) => a.title > b.title ? 1 : -1);

  return menu;
}



module.exports = async function() {
  // Pull in all the config files
  const modules = await requireGlob('../_includes/**/*.config.js', { reducer, bustCache: true });

  // Convert the components into our required format
  const componentGroups = modules.components.map(convertComponent).filter(Boolean);
  
  // Return the components and the menu, broken down into categories
  return {
    components: componentGroups.flat(),
    menu: prepareMenu(componentGroups)
  };
}
