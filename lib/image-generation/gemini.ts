import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface ImageGenerationConfig {
  model: string;
  apiKey: string;
  baseUrl: string;
  defaultParams: {
    resolution: string;
    quality: string;
    style: string;
  };
}

export interface GenerationRequest {
  prompt: string;
  filename: string;
  variations?: number;
  outputDir?: string;
}

export interface GeneratedImage {
  filename: string;
  path: string;
  width: number;
  height: number;
  format: string;
}

const config: ImageGenerationConfig = {
  model: 'google/gemini-2.5-flash-image-preview',
  apiKey: process.env.GEMINI_API_KEY || '',
  baseUrl: 'https://openrouter.ai/api/v1',
  defaultParams: {
    resolution: '2912x1632',
    quality: 'ultra-high',
    style: 'photorealistic commercial photography'
  }
};

export class GeminiImageGenerator {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
  }

  async generateImage(request: GenerationRequest): Promise<GeneratedImage> {
    const { prompt, filename, outputDir = 'public/images/generated' } = request;

    try {
      console.log(`🎨 Generating image: ${filename}`);
      console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

      // Make API request to OpenRouter
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://party-on-delivery.vercel.app',
          'X-Title': 'PartyOn Delivery Image Generation'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API request failed: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      // Extract image URL from response
      if (!data.choices || !data.choices[0]?.message) {
        throw new Error('No image generated in response');
      }

      // Check if images array exists in the message
      const message = data.choices[0].message;
      let imageData: string | null = null;

      if (message.images && message.images[0]) {
        // Extract base64 data from images array
        const imageUrl = message.images[0].image_url?.url || message.images[0].url;
        if (imageUrl) {
          imageData = imageUrl;
        }
      } else if (message.content) {
        // Fallback to content field
        imageData = message.content;
      }

      if (!imageData) {
        throw new Error('No image data found in response');
      }

      const imageContent = imageData;
      
      // Create output directory if it doesn't exist
      const fullOutputDir = path.resolve(outputDir);
      if (!fs.existsSync(fullOutputDir)) {
        fs.mkdirSync(fullOutputDir, { recursive: true });
      }

      // Save the generated image
      const outputPath = path.join(fullOutputDir, filename);
      
      // If it's a base64 image, decode and save
      if (imageContent.startsWith('data:image')) {
        const base64Data = imageContent.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(outputPath, buffer);
      } else if (imageContent.startsWith('http')) {
        // If it's a URL, download the image
        const imageResponse = await fetch(imageContent);
        const buffer = await imageResponse.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(buffer));
      } else {
        // Try to extract URL from markdown or other format
        const urlMatch = imageContent.match(/https?:\/\/[^\s\]]+/);
        if (urlMatch) {
          const imageResponse = await fetch(urlMatch[0]);
          const buffer = await imageResponse.arrayBuffer();
          fs.writeFileSync(outputPath, Buffer.from(buffer));
        } else {
          throw new Error('Could not extract image from response');
        }
      }

      // Get image metadata
      const metadata = await sharp(outputPath).metadata();

      console.log(`✅ Image generated successfully: ${outputPath}`);
      
      return {
        filename,
        path: outputPath,
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown'
      };
    } catch (error) {
      console.error(`❌ Error generating image:`, error);
      throw error;
    }
  }

  async generateVariations(
    prompt: string,
    baseFilename: string,
    count: number = 3,
    outputDir?: string
  ): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];
    
    for (let i = 1; i <= count; i++) {
      const filename = baseFilename.replace('.', `-v${i}.`);
      const image = await this.generateImage({
        prompt: `${prompt} (variation ${i})`,
        filename,
        outputDir
      });
      images.push(image);
    }
    
    return images;
  }

  async optimizeImage(
    inputPath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpg' | 'png';
    } = {}
  ): Promise<string> {
    const { width = 1456, height = 816, quality = 85, format = 'webp' } = options;
    
    const outputPath = inputPath.replace(/\.[^.]+$/, `-optimized.${format}`);
    
    await sharp(inputPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .toFormat(format, { quality })
      .toFile(outputPath);
    
    console.log(`🚀 Optimized image saved: ${outputPath}`);
    return outputPath;
  }

  async createResponsiveVariants(inputPath: string): Promise<{
    desktop: string;
    mobile: string;
    thumbnail: string;
  }> {
    const variants = {
      desktop: await this.optimizeImage(inputPath, { width: 1456, height: 816 }),
      mobile: await this.optimizeImage(inputPath, { width: 800, height: 450 }),
      thumbnail: await this.optimizeImage(inputPath, { width: 400, height: 225 })
    };
    
    // Rename files appropriately
    const baseDir = path.dirname(variants.desktop);
    const basename = path.basename(inputPath, path.extname(inputPath));
    
    fs.renameSync(variants.mobile, path.join(baseDir, `${basename}-mobile.webp`));
    fs.renameSync(variants.thumbnail, path.join(baseDir, `${basename}-thumbnail.webp`));
    
    return {
      desktop: variants.desktop,
      mobile: path.join(baseDir, `${basename}-mobile.webp`),
      thumbnail: path.join(baseDir, `${basename}-thumbnail.webp`)
    };
  }
}

export default GeminiImageGenerator;