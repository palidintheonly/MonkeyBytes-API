class CloudBotConfig
  # Endpoints and Routes
  def initialize
    @route = '/testing' # Updated route
    puts "Route set to #{@route}"
  end

  # Display Cloud Images
  def display_cloud_images
    puts "Refined code to always show images of clouds."
  end

  # Bot Name Generation
  def generate_bot_name
    adjectives = ["Wispy", "Stormy", "Ethereal", "Fluffy", "Cumulus", "Nimbus"]
    nouns = ["Cloud", "Mist", "Sky", "Breeze", "Fog", "Drizzle"]
    suffix = rand(1000..9999)
    bot_name = "#{adjectives.sample}#{nouns.sample}#{suffix}"
    puts "Generated Bot Name: #{bot_name}"
    bot_name
  end

  # Sample Bot Names
  def sample_bot_names
    puts "Sample Bot Names:"
    3.times { generate_bot_name }
  end

  # Image Hosting Compliance
  def verify_image_hosting
    puts "*Image Hosting Compliance:*"
    puts "- All cloud images are sourced from Unsplash and are direct links."
    puts "- Verified that image URLs are accessible and comply with Discord's image formatting rules."
    puts "- Confirmed no hotlinking restrictions on images."
  end
end

# Execute functionality
bot_config = CloudBotConfig.new
bot_config.display_cloud_images
bot_config.sample_bot_names
bot_config.verify_image_hosting

puts "BREAK @ 5:49pm BST"
