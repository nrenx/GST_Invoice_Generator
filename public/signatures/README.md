# Default Signatures

Place your signature images in this folder to make them available for quick selection in the invoice form.

## Supported Formats
- PNG (recommended - supports transparency)
- JPG/JPEG
- WebP

## Recommended Specifications
- **Size**: Keep images under 500KB for best performance
- **Dimensions**: 300-500px width, proportional height
- **Background**: Transparent PNG works best for professional look

## Naming Convention
Name your files descriptively for easy identification:
- `signature-1.png`
- `signature-ceo.png`
- `signature-manager.png`
- `john-doe-signature.png`

## Adding New Signatures
1. Add your signature image to this folder
2. Update the `signatures.json` file to include the new signature

## Example signatures.json entry
```json
{
  "signatures": [
    {
      "id": "sig-1",
      "name": "Signature 1",
      "filename": "signature-1.png"
    }
  ]
}
```
