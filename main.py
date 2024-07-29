import matplotlib.pyplot as plt

# Define ring properties
rings = [
    {'color': 'blue', 'center': (0, 0)},
    {'color': 'yellow', 'center': (1.5, -1)},
    {'color': 'black', 'center': (3, 0)},
    {'color': 'green', 'center': (4.5, -1)},
    {'color': 'red', 'center': (6, 0)},
]
radius = 1.2

# Create plot
fig, ax = plt.subplots()

# Add rings to the plot
for ring in rings:
    circle = plt.Circle(ring['center'], radius, edgecolor=ring['color'], facecolor='none', linewidth=10)
    ax.add_artist(circle)

# Set the aspect of the plot to be equal
ax.set_aspect('equal')

# Set limits and remove axes
ax.set_xlim(-3, 9)
ax.set_ylim(-4, 2)
ax.axis('off')

# Display the plot
plt.show()
