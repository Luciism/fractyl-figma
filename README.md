# Fractyl Figma

Fractyl is a pipeline for turning figma designs into SVG templates, exporting, and rendering them with actual data.

## Layouts

Layouts are designed in Figma using various elements such as frames, shapes, text, and images. They can have a mix of **static content** and **dynamic content**. When a layout is exported as a template, the static content will be extracted and rasterized to a PNG file. Dynamic content (shapes, images, text) will be exported as fragmented SVG files with placeholders that will be replaced with actual data at render time.

## IDs & Placeholders

You must give an ID to each dynamic element so that its placeholder can be identfied and replaced at render time. Placeholders are formatted as `elementid#attribute` for example `playername#text`. IDs can be assigned from each element's respective tab or from the `IDs` tab for more fine grained control.

## Elements

For content to be dynamic, it must be tagged as `text`, `image`, or `shape`. This can be achieved through the plugin UI through the `Text`, `Image`, and `Shape` tabs.

### Text

When a Figma text node is tagged as text, it will be exported to an SVG with all its styles:
- Font (size, weight, family)
- Fill color
- Alignment (left, center, right)

At render time, requests to the renderer will provide an array of text spans. By default, they will inherit the styles provided by exported text, otherwise they can be overriden on a per text span basis. This allows various styles to be specified at render time.

It is important to keep track of the fonts used throughout the layout, as the font files must be available to the renderer, (see [TODO](./todo))

### Shapes

Shapes are Figma rectangle nodes with dynamic properties including width, height, and color. Dynamic attributes can be managed from the `Shape` tab in the plugin UI.

When exported, shapes will include styles such as:
- Size (if fixed)
- Corner radius
- Stroke
- Fill color

Shapes sizes can be dynamic and are not mutually exclusive. At render time, the width and / or height (in pixels) can be provided with a placeholder:

```
"shapeid#width": "100"
"shapeid#height": "100"
```

*Replace `shapeid` with the actual ID of the shape.*

Shapes can also have dynamic colors. A dynamic color can either be a solid fill or a linear gradient fill (with a fixed amount of gradient stops).

To specify a dynamic solid fill at render time:

```
"shapeid#fill": "#ff0000"
```

To specify a dynamic gradient fill at render time:

```
"shapeid#gradientStop.0": "#ff0000"
"shapeid#gradientStop.1": "#00ff00"
"shapeid#gradientStop.2": "#0000ff"
...
```


### Images

Dynamic images can be inserted at render time. For example:

```
"imageid#href": "data:image/png;base64,..."
```

## Custom Backgrounds

At render time, a image can be provided and used as a background image for the layout. This works by exporting a reduced opacity static raster alongside its content mask. At render time, the mask is applied to the background image and composited with the translucent static raster.

To reduce the opacity, each node tree of a layout is walked until the first one with a fill is found. This node will have its fill opacity reduced. This would work with a in the case of a single background fill or a grid-like tile layout.

## Exporting

To do a complete export of a layout, select the entire layout and use **Complete Export** button in the `Export` tab of the plugin UI. This will generate all the static images and dynamic fragments and compress them to zip file for download.

Once downloaded, extract the contents of the zip file into it's own folder inside the `templates/` folder of the renderer.

*This may take a while depending on the layout size.*

## Development

The plugin UI is a react app that builds to a single `dist/ui/index.html` file.

### Structure

- UI code lives in `src/ui`
- Plugin logic code lives in `src/code`
- Shared types and code live in `src/shared`

### Build

- To build the UI: `npm run buildui`
- To build the plugin code: `npm run buildcode`
- To build both: `npm run build`
