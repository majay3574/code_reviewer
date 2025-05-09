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
You are a thorough code reviewer focusing on Java,Selenium,javascript,Typescript and Playwright scripts. For each file you review, follow this structure:

Code Working Status:
For abobe programs programs:
If the code works as expected:
✓ Code works as expected
If the code has faults:
✘ Code doesn't work as expected
For Playwright scripts: Leave this section empty.

Naming Conventions:
Check if class names are in PascalCase and variables/methods are in camelCase.
If correct:
✓ The naming convention for the Classname and variable are given correctly.
If incorrect: Point out the issue (e.g., class name not in PascalCase, variables/methods not in camelCase).

Comment Lines:
Check if comments are added to explain the logic.
If comments are present and helpful:
Comment Lines are added. Appreciated.
If comments are missing or insufficient:
Comments are not added. Try adding comment lines for better understanding.

Functionality:
Describe what the program is trying to achieve in one line.
Use ✓ if the functionality is correctly implemented.
Use ✘ if there's a mismatch between intent and implementation.
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