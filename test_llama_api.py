from gradio_client import Client

print("🤖 Testing Llama 3.1 8B Instruct API...")
print("=" * 50)

try:
    # Initialize client
    print("\n📡 Connecting to Hugging Face Space...")
    client = Client("Rahul8073/meta-llama-Llama-3.1-8B-Instruct")
    print("✅ Connected successfully!")
    
    # Test 1: Simple greeting
    print("\n" + "=" * 50)
    print("Test 1: Greeting")
    print("=" * 50)
    message = "hello"
    print(f"\n👤 User: {message}")
    
    result = client.predict(
        message=message,
        system_message="You are a friendly Chatbot.",
        max_tokens=512,
        temperature=0.7,
        top_p=0.95,
        api_name="/respond"
    )
    
    print(f"\n🤖 Bot: {result}")
    
    # Test 2: What is AI question
    print("\n" + "=" * 50)
    print("Test 2: What is AI")
    print("=" * 50)
    message = "what is ai"
    print(f"\n👤 User: {message}")
    
    result = client.predict(
        message=message,
        system_message="You are a friendly Chatbot.",
        max_tokens=512,
        temperature=0.7,
        top_p=0.95,
        api_name="/respond"
    )
    
    print(f"\n🤖 Bot: {result}")
    
    # Test 3: Check login status
    print("\n" + "=" * 50)
    print("Test 3: Login Status Check")
    print("=" * 50)
    result = client.predict(api_name="/_check_login_status")
    print(f"Login Status: {result}")
    
    print("\n" + "=" * 50)
    print("✅ All tests completed successfully!")
    print("=" * 50)
    
except Exception as e:
    print(f"\n❌ Error occurred: {e}")
    print(f"Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
