import type { NextApiRequest, NextApiResponse } from 'next';

interface ProposalContent {
    problem?: string;
    solution?: string;
    [key: string]: string | undefined;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Invalid proposal ID' });
    }

    const projectId = typeof id === 'string' ? id : String(id);

    try {
        // First, get the proposal to find its URL
        // Try multiple sources
        let proposal: any = null;
        
        // Try external API first
        try {
            const altResponse = await fetch(`https://gov.meshjs.dev/api/catalyst/proposals?projectIds=${projectId}`, {
                headers: {
                    'User-Agent': 'dashboard-template/1.0',
                },
            });
            
            if (altResponse.ok) {
                const altData = await altResponse.json();
                proposal = altData.proposals?.find((p: any) => p.project_id === projectId);
            }
        } catch (e) {
            console.log('External API fetch failed, trying local sources');
        }
        
        // If not found externally, check Fund 15 proposals
        if (!proposal) {
            const FUND_15_PROPOSALS = [
                {
                    project_id: '1500001',
                    url: 'https://projectcatalyst.io/funds/15/cardano-use-cases-prototype-and-launch/blockprint-or-gimbalabs-build-a-cardano-treasury-explorer'
                },
                {
                    project_id: '1500002',
                    url: 'https://projectcatalyst.io/funds/15/cardano-use-cases-prototype-and-launch/cs-code-web-ide-scaffolder-for-onchain-and-offchain-code'
                }
            ];
            
            proposal = FUND_15_PROPOSALS.find((p: any) => p.project_id === projectId);
        }
        
        if (!proposal || !proposal.url) {
            return res.status(404).json({ message: 'Proposal URL not found' });
        }

        return await fetchAndParseProposal(proposal.url, res);
    } catch (error) {
        console.error('Error fetching proposal content:', error);
        res.status(500).json({ message: 'Failed to fetch proposal content' });
    }
}

async function fetchAndParseProposal(url: string, res: NextApiResponse) {
    try {
        // Fetch the Catalyst proposal page
        const htmlResponse = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!htmlResponse.ok) {
            throw new Error(`Failed to fetch proposal page: ${htmlResponse.status}`);
        }

        const html = await htmlResponse.text();
        
        // Parse HTML to extract proposal content
        const content = parseProposalHTML(html);
        
        if (content && (content.problem || content.solution || content.impact)) {
            // Return structured JSON with key sections
            return res.status(200).json(content);
        }

        // Fallback: return formatted text
        const textContent = formatProposalText(content);
        return res.status(200).send(textContent);
    } catch (error) {
        console.error('Error parsing proposal:', error);
        // Return a message with link
        return res.status(200).send(
            `Full proposal content is available at: ${url}\n\n` +
            `Please visit the link above to view the complete proposal details.`
        );
    }
}

function parseProposalHTML(html: string): ProposalContent {
    const content: ProposalContent = {};
    
    // Helper function to extract section content more comprehensively
    const extractSection = (sectionName: string, html: string): string | null => {
        // Try multiple patterns to find the section
        // Use [\s\S] instead of . with s flag for better compatibility
        const patterns = [
            // Standard heading pattern
            new RegExp(`<h[2-4][^>]*>[\\s\\S]*?${sectionName}[\\s\\S]*?<\\/h[2-4]>([\\s\\S]*?)(?=<h[1-4]|$)`, 'i'),
            // With class or id attributes
            new RegExp(`<h[2-4][^>]*class="[^"]*${sectionName}[^"]*"[^>]*>[\\s\\S]*?<\\/h[2-4]>([\\s\\S]*?)(?=<h[1-4]|$)`, 'i'),
        ];
        
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    };
    
    // Extract problem section
    const problemContent = extractSection('Problem', html);
    if (problemContent) {
        content.problem = removeQuestions(cleanHTML(problemContent));
    }
    
    // Extract solution section - try to get full content
    const solutionContent = extractSection('Solution', html);
    if (solutionContent) {
        // Get more content by looking for the next major section
        // Find where Solution section ends by looking for next major headings
        // Use [\s\S] instead of . with s flag for better compatibility
        const solutionMatch = html.match(/<h[2-4][^>]*>[\s\S]*?Solution[\s\S]*?<\/h[2-4]>([\s\S]*?)(?=<h[1-4][^>]*>[\s\S]*?(?:Impact|Feasibility|Challenge|Proposal|Problem|Auditability|Budget|Timeline|Team|Roadmap|Conclusion|Next|Steps)[\s\S]*?<\/h[1-4]|$)/i);
        if (solutionMatch && solutionMatch[1]) {
            content.solution = removeQuestions(cleanHTML(solutionMatch[1]));
        } else if (solutionContent) {
            content.solution = removeQuestions(cleanHTML(solutionContent));
        }
    }
    
    // Extract Impact section explicitly
    const impactContent = extractSection('Impact', html);
    if (impactContent && !content.impact) {
        content.impact = removeQuestions(cleanHTML(impactContent));
    }
    
    // Extract other common sections
    const sections = ['Challenge', 'Proposal', 'Feasibility', 'Auditability'];
    
    sections.forEach(section => {
        const sectionContent = extractSection(section, html);
        if (sectionContent && !content[section.toLowerCase()]) {
            content[section.toLowerCase()] = removeQuestions(cleanHTML(sectionContent));
        }
    });
    
    return content;
}

function cleanHTML(html: string): string {
    // First, preserve line breaks from <br>, <p>, <div> tags
    let cleaned = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<ul[^>]*>|<ol[^>]*>/gi, '')
        .replace(/<\/ul>|<\/ol>/gi, '\n');
    
    // Then remove all other HTML tags
    // Use [\s\S] instead of . with s flag for better compatibility
    cleaned = cleaned
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&#8216;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8211;/g, '-')
        .replace(/&#8212;/g, '--')
        .replace(/&hellip;/g, '...');
    
    // Clean up excessive whitespace but preserve paragraph breaks
    cleaned = cleaned
        .replace(/[ \t]+/g, ' ')  // Multiple spaces to single space
        .replace(/\n{3,}/g, '\n\n')  // More than 2 newlines to 2
        .trim();
    
    return cleaned;
}

function removeQuestions(text: string): string {
    if (!text) return text;
    
    // Split by sentences/paragraphs
    const lines = text.split(/\n+/).filter(line => line.trim());
    
    // Filter out lines that are questions
    const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        // Remove lines that end with "?" (questions)
        if (trimmed.endsWith('?')) {
            return false;
        }
        // Remove lines that start with common question words (but be less aggressive for longer content)
        const questionPatterns = /^(what|who|when|where|why|how|which|can|could|would|should|is|are|was|were|do|does|did|will|may|might)\s+/i;
        // Only filter short question-like lines (less than 80 chars) to avoid removing actual content
        if (questionPatterns.test(trimmed) && trimmed.length < 80) {
            return false;
        }
        return true;
    });
    
    return filteredLines.join('\n\n').trim();
}

function formatProposalText(content: ProposalContent): string {
    let text = '';
    
    // Only show Impact section in full content, exclude problem, solution, proposal, and feasibility
    // Solution is already displayed in the boxes above
    if (content.impact) {
        let sectionText = content.impact || '';
        // Remove questions
        sectionText = removeQuestions(sectionText);
        sectionText = sectionText.trim();
        if (sectionText) {
            text += `[Impact]\n${sectionText}\n\n`;
        }
    }
    
    return text.trim() || 'Proposal content could not be extracted. Please visit the proposal URL for full details.';
}
