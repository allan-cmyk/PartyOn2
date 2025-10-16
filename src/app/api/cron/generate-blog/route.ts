import { NextRequest, NextResponse } from 'next/server';
import { getAllMDXPosts } from '@/lib/blog-mdx';
import fs from 'fs';
import path from 'path';

interface Topic {
  id: number;
  title: string;
  category: string;
  keywords: string[];
  published: boolean;
}

interface TopicsData {
  topics: Topic[];
}

// Helper functions
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function generateBlogContent(topic: Topic): Promise<string> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.GOOGLE_API_KEY || '';

  const prompt = `You are an expert content writer for Party On Delivery, an Austin-based premium alcohol delivery service specializing in weddings, bachelor/bachelorette parties, boat parties, and corporate events.

Write a comprehensive, engaging 2,000+ word blog post about: "${topic.title}"

IMPORTANT GUIDELINES:
- Write in a conversational, friendly tone with authentic Austin/Texas personality
- Include specific Austin locations, venues, and local references
- Add practical tips, actionable advice, and insider knowledge
- Include real scenarios and examples (can be fictionalized but realistic)
- Naturally mention Party On Delivery services where relevant (not salesy)
- Use subheadings (##) to break up content
- Include bullet points and numbered lists where appropriate
- End with a clear next step or call-to-action related to Party On Delivery
- Target keywords: ${topic.keywords.join(', ')}

The blog should be informative, entertaining, and genuinely helpful to readers planning events in Austin.

STRUCTURE:
1. Engaging introduction with a hook
2. 5-7 main sections with descriptive subheadings
3. Practical tips and actionable advice throughout
4. Natural mentions of Party On Delivery where relevant
5. Conclusion with call-to-action

Write the blog post in Markdown format:`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://partyondelivery.com',
      'X-Title': 'Party On Delivery Blog Generator'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Load topics
    const topicsPath = path.join(process.cwd(), 'scripts', 'topics.json');
    const topicsData: TopicsData = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));

    // Get next unpublished topic
    const topic = topicsData.topics.find(t => !t.published);

    if (!topic) {
      return NextResponse.json({
        success: false,
        message: 'No unpublished topics remaining'
      });
    }

    const slug = createSlug(topic.title);

    // Generate content
    console.log(`Generating blog content for: ${topic.title}`);
    const content = await generateBlogContent(topic);

    // Create MDX file with frontmatter
    const date = formatDate(new Date());
    const excerpt = content.substring(0, 160).replace(/"/g, '\\"');

    const mdxContent = `---
title: "${topic.title}"
date: "${date}"
category: "${topic.category}"
excerpt: "${excerpt}..."
image: "/images/hero/lake-travis-yacht-sunset.webp"
keywords: ${JSON.stringify(topic.keywords)}
author: "Party On Delivery Team"
---

${content}
`;

    // Save MDX file
    const postsDir = path.join(process.cwd(), 'content', 'blog', 'posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    const filename = `${slug}.mdx`;
    const filepath = path.join(postsDir, filename);
    fs.writeFileSync(filepath, mdxContent);

    // Mark topic as published
    topic.published = true;
    fs.writeFileSync(topicsPath, JSON.stringify(topicsData, null, 2));

    // Note: Image generation is skipped in Vercel cron due to execution time limits
    // Images would need to be generated separately or use a different approach

    return NextResponse.json({
      success: true,
      message: 'Blog post generated successfully',
      data: {
        title: topic.title,
        slug: slug,
        filepath: filepath,
        wordCount: Math.round(content.split(' ').length),
        url: `/blog/${slug}`,
        note: 'Images not generated in cron job - add manually or use placeholder'
      }
    });

  } catch (error) {
    console.error('Error generating blog post:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
