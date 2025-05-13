document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reviewForm');
    const loading = document.getElementById('loading');
    const output = document.getElementById('output');
    const downloadBtn = document.getElementById('downloadBtn');

    // Initialize the particles animation
    initParticles();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const githubUrl = document.getElementById('githubUrl').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();
        const model = document.getElementById('modelSelect').value;

        if (!githubUrl || !apiKey) return;

        output.value = '';
        downloadBtn.style.display = 'none';
        loading.style.display = 'block';

        try {
            const result = await generateReview(githubUrl, apiKey, model);
            output.value = result;
            downloadBtn.style.display = 'block';
        } catch (error) {
            output.value = `Error: ${error.message}`;
        } finally {
            loading.style.display = 'none';
        }
    });

    async function generateReview(githubUrl, apiKey, model) {
        const prompt = `
Review the code in this GitHub repository: ${githubUrl}
You are an expert code reviewer with in-depth knowledge in XPath, CSS, Java, Selenium, JavaScript, TypeScript, and Playwright.
Analyze the provided code thoroughly from top to bottom and return a structured review following the detailed checklist below:
✅ 1. Code Working Status
For complete automation or script-based code (Java, TypeScript, Playwright, etc.):
✓ Code works as expected — if it runs without issues.
✘ Code doesn't work as expected — if there are runtime errors or logic flaws.\
For code snippets or partial programs: Leave this section empty.
🧾 2. Naming Conventions
Ensure:
Class names follow PascalCase
Methods and variables use camelCase
Constants use UPPER_SNAKE_CASE
Provide:
✓ Naming conventions are correct
or list specific violations (e.g., “Variable should be in camelCase”)
💬 3. Comment Quality
If comments are:
Present and explain the logic well:
✓ Helpful comments are included. Good practice.
Missing or unhelpful:
✘ Comments are missing or inadequate. Please add comments to explain logic.
⚙️ 4. Functionality Summary
In one concise sentence, summarize what the code is intended to do.
Then mark:
✓ Functionality is correctly implemented
or ✘ Functionality doesn’t align with its intended purpose
🧱 5. Code Structure & Modularity
Is the code split into reusable functions or methods?
Are responsibilities separated (e.g., no large God classes)?
Feedback options:
✓ Code is well-structured and modular
or list issues like: "Too many responsibilities in a single function", "Consider splitting logic"
🚀 6. Performance & Optimization
Look for:
Unnecessary DOM queries
Redundant loops
Inefficient selectors in XPath or CSS
Feedback options:
✓ Code is optimized for performance
or: ✘ Performance bottlenecks found – suggest improving selector strategy or reducing repetition
👁️ 7. Readability & Formatting
Check for:
Indentation
Line spacing
Meaningful variable names
Feedback:
✓ Code is clean and easy to read
or: ✘ Code readability can be improved – suggest better formatting/naming
🧪 8. Testability (for Automation Scripts)
Can the script be easily tested or integrated into CI/CD pipelines?
Are there:
Clear test assertions?
Stable selectors?
Environment independence?
Feedback:
✓ Script is testable and robust
or: ✘ Testability concerns – consider making selectors more stable or parameterizing data

`;

        const response = await fetch('https://api.cohere.com/v2/chat', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();
        console.log(data);

        // Handle the response extraction
        if (data.message && data.message.content && data.message.content.length > 0) {
            // Handle new Cohere API response format where content is an array of objects
            const textContent = data.message.content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join('\n');
            if (textContent) return textContent;
        }

        // Fallback to previous format checks
        if (data.text) return data.text;
        if (data.message?.text) return data.message.text;
        if (data.response?.text) return data.response.text;

        throw new Error("Unable to extract response text from Cohere API.");
    }

    downloadBtn.addEventListener('click', () => {
        const text = output.value;
        if (!text) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `code-review-${timestamp}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Function to initialize particles animation
    function initParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }
    }

    function createParticle() {
        const particlesContainer = document.getElementById('particles');
        const particle = document.createElement('div');
        particle.classList.add('tech-particle');

        // Random position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        // Random size
        const size = Math.random() * 3 + 1;

        // Set styles
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = Math.random() * 0.5 + 0.1;

        // Add to container
        particlesContainer.appendChild(particle);

        // Animate
        animateParticle(particle);
    }

    function animateParticle(particle) {
        // Random movement
        const duration = Math.random() * 20000 + 10000; // 10-30 seconds
        const xMovement = Math.random() * 100 - 50; // -50 to 50px
        const yMovement = Math.random() * 100 - 50; // -50 to 50px

        // Create animation
        particle.animate([
            { transform: 'translate(0, 0)', opacity: particle.style.opacity },
            { transform: `translate(${xMovement}px, ${yMovement}px)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out'
        }).onfinish = () => {
            // Remove old particle
            particle.remove();
            // Create new particle
            createParticle();
        };
    }
});